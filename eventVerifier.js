var moment = require('moment');
var CONSTANTS = require("./CONSTANTS");
var statesRepository = require('./repositories/statesRepository')
var sensorsRepository = require('./repositories/sensorsRepository')
var fcm = require('./firebase/fcm')

var isHome, sleepTimeFromInMinutes, sleepTimeToInMinutes, medicineTimeInMinutes;

function updateStates(callback) {
	statesRepository.getStates(function(result) {
		var numberOfPeople = Number(result.states.numberOfPeople);
        var medicineHour = Number(result.states.medicineTime.hour);
    	var medicineMinute = Number(result.states.medicineTime.minute);
        var sleepHourFrom = Number(result.states.sleepTime.from.hour);
        var sleepMinuteFrom = Number(result.states.sleepTime.from.minute);
        var sleepHourTo = Number(result.states.sleepTime.to.hour);
        var sleepMinuteTo = Number(result.states.sleepTime.to.minute);

        //Set isHome
        if(numberOfPeople >= 1) {
        	isHome = true;
        } else {
        	isHome = false;
        }

        //Set sleepTime in minutes
        sleepTimeFromInMinutes = (sleepHourFrom * 60) + sleepMinuteFrom
        sleepTimeToInMinutes = (sleepHourTo * 60) + sleepMinuteTo

        //Set medicineTime in minutes
        medicineTimeInMinutes = (medicineHour * 60) + medicineMinute

        callback();
	});
}

function verifyIdleness() {
	console.log("[" + (new Date()).toLocaleString() + "]" + "Verifying idleness");
	//If passed X time since last movement detection and is not in the sleeping time, then send push notification Idleness
	if(!isBetweenSleepTime()) {
		sensorsRepository.getLastMovementRegistry(function(err, post) {
			if(err) {
				console.log("[" + (new Date()).toLocaleString() + "]" + "Some error happened when verifying idleness: " + err.message);
			} else if (post !== null) {
	      		if(itsBeenMoreThanInterval(post.createdDate, CONSTANTS.IDLENESS_INTERVAL)) {
	      			console.log("[" + (new Date()).toLocaleString() + "]" + "Idlness detected, sending push notification");
	      			//TODO send time by parameter
	      			fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_ATTENTION"), __("PUSH_NOTIFICATION_BODY_IDLNESS"));
	      		}
		    } 
		});
	} else {
		console.log("[" + (new Date()).toLocaleString() + "]" + "Monitored is in sleep time ");
	}
}

function verifyMedicineTime() {
	console.log("[" + (new Date()).toLocaleString() + "]" + "Verifying medicine time");
	//If passed X time since the configured time to take medicine and no medicine event happened, then send push notification Didn't take medicine
	sensorsRepository.getLastMedicineRegistry(function(err, post) {
		if(err) {
				console.log("[" + (new Date()).toLocaleString() + "]" + "Some error happened when verifying medicine time: " + err.message);
		} else if (post !== null) {
      		var dateNow = moment();
			var nowInMinutes = (dateNow.hour()*60) + dateNow.minute();
      		var diffNowInSeconds = (nowInMinutes - medicineTimeInMinutes) * 60
      		if(moment(post.createdDate).isSame(moment(), 'day')) {
	      		var lastMedicine = moment(post.createdDate);
	      		var lastMedicineInMinutes = (lastMedicine.hour()*60) + lastMedicine.minute();
	      		var diffLastMedicineInSeconds = (medicineTimeInMinutes - lastMedicineInMinutes) * 60

	      		if(diffLastMedicineInSeconds >= CONSTANTS.PRE_MEDICINE_INTERVAL) {
	      			if(diffNowInSeconds >= CONSTANTS.POST_MEDICINE_INTERVAL) {
	      				console.log("[" + (new Date()).toLocaleString() + "]" + "No medicine detected, sending push notification");
	      				fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_ATTENTION"), __("PUSH_NOTIFICATION_BODY_NO_MEDICINE"));
	      			}
	      		}
      		} else {
      			if(diffNowInSeconds >= CONSTANTS.POST_MEDICINE_INTERVAL) {
      				console.log("[" + (new Date()).toLocaleString() + "]" + "No medicine detected, sending push notification");
      				fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_ATTENTION"), __("PUSH_NOTIFICATION_BODY_NO_MEDICINE"));
      			}
      		}
      	} 
	});
}

function isBetweenSleepTime() {
	var dateNow = moment();
	var nowInMinutes = (dateNow.hour()*60) + dateNow.minute();
	if(sleepTimeFromInMinutes >= sleepTimeToInMinutes) {
		if(nowInMinutes >= sleepTimeFromInMinutes) {
			return true;
		} else if (nowInMinutes <= sleepTimeToInMinutes) {
			return true;
		} else {
			return false;
		}
	} else {
		if(nowInMinutes >= sleepTimeToInMinutes && nowInMinutes <= sleepTimeFromInMinutes) {
			return true;
		} else {
			return false;
		}
	}
}

function itsBeenMoreThanInterval(lastEntryDate, interval) {
	var dateNow = moment();
	var entryDate = moment(lastEntryDate);
	return moment.duration(dateNow.diff(entryDate)).asSeconds() > interval;
}

function verifyEvents() {
	updateStates(function() {
		console.log("[" + (new Date()).toLocaleString() + "]" + "Event verifier triggered");
		verifyMedicineTime();
		if(isHome) {
			console.log("[" + (new Date()).toLocaleString() + "]" + "Monitored is in home");
			verifyIdleness();
		}
	});
}

module.exports = function(){
	setInterval(function(){ 
		verifyEvents(); 
	}, (CONSTANTS.EVENT_VERIFIER_INTERVAL*1000));
}
