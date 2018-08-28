var CONSTANTS = require("./CONSTANTS");
var db = require("./db");  
var moment = require('moment');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
var xmlFile = __dirname + "/../states.xml";

var Sensors = db.Mongoose.model('sensors', db.SensorSchema, 'sensors');

var isHome, sleepTimeFromInMinutes, sleepTimeToInMinutes, medicineTimeInMinutes;

function updateStates() {
	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML states file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML states file: " + err.message);
            	}
                var numberOfPeople = result.states.numberOfPeople;
                var medicineHour = result.states.medicineTime.hour;
            	var medicineMinute = result.states.medicineTime.minute;
                var sleepHourFrom = result.states.sleepTime.from.hour;
                var sleepMinuteFrom = result.states.sleepTime.from.minute;
                var sleepHourTo = result.states.sleepTime.to.hour;
                var sleepMinuteTo = result.states.sleepTime.to.minute;

                //Set isHome
                if(numberOfPeople >= 1) {
                	isHome = true;
                } else {
                	isHome = false;
                }

                //Set sleepTime in minutes
                sleepTimeFromInMinutes = (sleepHourFrom * 60) + selepMinuteFrom
                sleepTimeToInMinutes = (sleepHourTo * 60) + sleepMinuteTo

                //Set medicineTime in minutes
                medicineTimeInMinutes = (medicineHour * 60) + medicineMinute
            });
        }
   });
}

function verifyIdleness() {
	//If passed X time since last movement detection and is not in the sleeping time, then send push noticiation Not moving

	if(!isBetweenSleepTime()) {
		Sensors.findOne().or([
	          { $and: [{type: "movement"}, {info: "moving"}] },
	          { $and: [{type: "passage"}, {info: "hall"}] }
	      ]).sort({createdDate: -1}).exec(function(err, post){
	      	if (post !== null) {
	      		if(itsBeenLessThanInterval(post.createdDate, CONSTANTS.IDLENESS_INTERVAL)) {
	      			//TODO Push Notification
	      		}
	      	} 
		});
  	}
}

function verifyMedicineTime() {
	//If passed X time since the configured time to take medicine and no medicine event happened, then send push notification Didn't take medicine

	Sensors.findOne({ $and: [{type: "door"}, {info: "medicine"}] })
			.sort({createdDate: -1}).exec(function(err, post){
      	if (post !== null) {
      		var nowInMinutes = moment.duration().asMinutes();
      		var diffNowInSeconds = (nowInMinutes - medicineTimeInMinutes) * 60
      		if(moment(post.createdDate).isSame(moment(), 'day')) {
	      		var lastMedicineInMinutes = moment(post.createdDate).duration().asMinutes();
	      		var diffLastMedicineInSeconds = (medicineTimeInMinutes - lastMedicineInMinutes) * 60

	      		if(diffLastMedicineInSeconds >= CONSTANTS.PRE_MEDICINE_INTERVAL) {
	      			if(diffNowInSeconds >= CONSTANTS.POST_MEDICINE_INTERVAL) {
	      				//TODO Push Notification
	      			}
	      		}
      		} else {
      			if(diffNowInSeconds >= CONSTANTS.POST_MEDICINE_INTERVAL) {
      				//TODO Push Notification
      			}

      		}
      	} 
	});
}

function sendPushNotification() {
	
}

function isBetweenSleepTime() {
	var nowInMinutes = moment.duration().asMinutes();
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
	updateStates();
	verifyMedicineTime();
	if(isHome) {
		verifyIdleness();
	}

	console.log("OIEEE");
}

module.exports = function(){
	setInterval(function(){ 
		verifyEvents(); 
	}, CONSTANTS.EVENT_VERIFIER_INTERVAL);
}
