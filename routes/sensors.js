var express = require('express');
var router = express.Router();
var db = require("../db");
var moment = require('moment');
var CONSTANTS = require("../CONSTANTS");
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
var xmlFile = __dirname + "/../states.xml";

var Sensors = db.Mongoose.model('sensors', db.SensorSchema, 'sensors');

function getLastMainRegistry(callback) {
	Sensors.findOne().or([
          { $and: [{type: "door"}, {info: "main"}] },
          { $and: [{type: "passage"}, {info: "main"}] }
      ]).sort({createdDate: -1}).exec(function(err, post){
    	callback(post);
	});
}

function itsBeenLessThanInterval(lastEntryDate) {
	var dateNow = moment();
	var entryDate = moment(lastEntryDate);
	return moment.duration(dateNow.diff(entryDate)).asSeconds() <= CONSTANTS.HOME_ENTRANCE_INTERVAL;
}

function updateNumberOfPeople(update) {
	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML states file: " + err.message);
			return;
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML states file: " + err.message);
					return;
            	}
                var updatedValue = (Number(result.states.numberOfPeople) + update).toString();
                result.states.numberOfPeople = updatedValue < 0 ? 0 : updatedValue;

                var builder = new xml2js.Builder();
        		var xmlText = builder.buildObject(result);
        		fs.writeFile(xmlFile, xmlText, function(err, data){
            		if (err) {
            			console.log("Error updating number of people in XML states file: " + err.message);
            			return;
            		}
            		console.log("Successfully updated number of people in XML states file!");
       			})
       			return;
            });
        }
   });
}

/* Insert sensor notification in database */
router.post('/', function(req, res) {
	console.log("Receive POST to /sensors: " + req.body);

	var type =  req.body.type;
	var info = req.body.info;

	if(type == "door") {
		if (info !== "main" && info !== "medicine") {
			res.status(400);
			res.send({ error: "Invalid info for the type door"});
			return;
		} else if (info == "main") {
			getLastMainRegistry(function(lastMainRegistry) {
				if (lastMainRegistry !== null && lastMainRegistry.type == "passage" && itsBeenLessThanInterval(lastMainRegistry.createdDate)) {
					//Someone entered the house, so update is plus one
					console.log("Someone entered the house.");
					updateNumberOfPeople(1);
				}
			});
		}
	} else if (type == "passage") {
		if (info !== "main" && info !== "hall") {
			res.status(400);
			res.send({ error: "Invalid info for the type passage"});
			return;
		} else if (info == "main") {
			getLastMainRegistry(function(lastMainRegistry) {
				if (lastMainRegistry !== null && lastMainRegistry.type == "door" && itsBeenLessThanInterval(lastMainRegistry.createdDate)) {
					//Someone left the house, so update is minus one
					console.log("Someone left the house.");
					updateNumberOfPeople(-1);
				}
			});
		}
	} else if (type == "moviment") {
		if (info !== "moving" && info !== "fall") {
			res.status(400);
			res.send({ error: "Invalid info for the type moviment"});
			return;
		}
	}

	var sensor = new Sensors({ type: type, info: info });
	sensor.save(function (err) {
		if(err) {
			console.log("Error saving in database: " + err.message);
			res.status(400);
			res.send(err);
		} else {
			console.log("Post saved!");
			res.status(200);
			res.send(req.body);
		}
	})	
});

module.exports = router;