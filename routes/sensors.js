var express = require('express');
var router = express.Router();
var moment = require('moment');
var CONSTANTS = require("../CONSTANTS");
var statesRepository = require('../repositories/statesRepository')
var sensorsRepository = require('../repositories/sensorsRepository')
var fcm = require('../firebase/fcm')

function itsBeenLessThanInterval(lastEntryDate) {
	var dateNow = moment();
	var entryDate = moment(lastEntryDate);
	return moment.duration(dateNow.diff(entryDate)).asSeconds() <= CONSTANTS.HOME_ENTRANCE_INTERVAL;
}

/* Insert sensor notification in database */
router.post('/', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "POST to /sensors: " + JSON.stringify(req.body));

	var type =  req.body.type;
	var info = req.body.info;
	var createdDate = req.body.createdDate;

	if(type == "door") {
		if (info !== "main" && info !== "medicine") {
			res.status(400);
			res.send({ error: "Invalid info for the type door"});
			return;
		} else if (info == "main") {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Received door/main event");
			sensorsRepository.getLastMainRegistry(function(err, post) {
				if(err) {
					console.log("[" + (new Date()).toLocaleString() + "] " + "Some error happened when checking Return Home event: " + err.message);
				} else if (post !== null && post.type == "passage" && itsBeenLessThanInterval(post.createdDate)) {
					//If current number of people is zero, then send push notification Return Home
					statesRepository.getStates(function(result) {
						var numberOfPeople = Number(result.states.numberOfPeople);
						if(numberOfPeople == 0) {
							console.log("[" + (new Date()).toLocaleString() + "] " + "The monitored returned home!");
							fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_EVENT_HAPPENED"), __("PUSH_NOTIFICATION_BODY_RETURN_HOME"));
						}

						//Someone entered the house, so update is plus one
						//console.log("[" + (new Date()).toLocaleString() + "] " + "Someone entered the house.");
						statesRepository.updateNumberOfPeople(1);
					});	
				}
			});
		} else {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Received door/medicine event");
			console.log("[" + (new Date()).toLocaleString() + "] " + "The monitored has taken the medicine!");
			//if is a medicine event, then send push notification Took Medicine
			fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_EVENT_HAPPENED"), __("PUSH_NOTIFICATION_BODY_TOOK_MEDICINE"));
		}
	} else if (type == "passage") {
		if (info !== "main" && info !== "hall") {
			res.status(400);
			res.send({ error: "Invalid info for the type passage"});
			return;
		} else if (info == "main") {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Received passage/main event");
			sensorsRepository.getLastMainRegistry(function(err, post) {
				if(err) {
					console.log("[" + (new Date()).toLocaleString() + "] " + "Some error happened when checking Left Home event: " + err.message);
				} else if (post !== null && post.type == "door" && itsBeenLessThanInterval(post.createdDate)) {
					//If current number of people is one, then send push notification Left Home
					statesRepository.getStates(function(result) {
						var numberOfPeople = Number(result.states.numberOfPeople);
						if(numberOfPeople == 1) {
							console.log("[" + (new Date()).toLocaleString() + "] " + "The monitored left home!");
							fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_EVENT_HAPPENED"), __("PUSH_NOTIFICATION_BODY_LEFT_HOME"));
						}

						//Someone left the house, so update is minus one
						//console.log("[" + (new Date()).toLocaleString() + "] " + "Someone left the house.");
						statesRepository.updateNumberOfPeople(-1);
					});	
				}
			});
		} else {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Received passage/hall event");
		}
	} else if (type == "movement") {
		if (info !== "moving" && info !== "fall") {
			res.status(400);
			res.send({ error: "Invalid info for the type movement"});
			return;
		} else if (info == "fall") {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Received movement/fall event");
			//if is a fall event, then end push notifiation Fall
			console.log("[" + (new Date()).toLocaleString() + "] " + "The monitored has fallen!");
			fcm.sendPushNotification(__("PUSH_NOTIFICATION_TITLE_EVENT_HAPPENED"), __("PUSH_NOTIFICATION_BODY_FALL"));
		} else {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Received movement/moving event");
		}
	}

	var post;
	if(createdDate) {
		post = { type: type, info: info, createdDate: createdDate };
	} else {
		post = { type: type, info: info };
	}
	sensorsRepository.save(post, function(err) {
		if(err) {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Error saving in database: " + err.message);
			res.status(400);
			res.send(err);
		} else {
			console.log("[" + (new Date()).toLocaleString() + "] " + "Post saved!");
			res.status(200);
			res.send(req.body);
		}
	});
});

module.exports = router;