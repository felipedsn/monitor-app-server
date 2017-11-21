var express = require('express');
var router = express.Router();
var db = require("../db");
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
var xmlFile = __dirname + "/../states.xml";

router.get('/', function(req, res) {
	console.log("Receive GET to /preferences");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML states file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML states file: " + err.message);
					res.status(400);
					res.send(err);
            	}
                var medicineHour = result.states.medicineTime.hour;
            	var medicineMinute = result.states.medicineTime.minute;
                var sleepHourFrom = result.states.sleepTime.from.hour;
                var sleepMinuteFrom = result.states.sleepTime.from.minute;
                var sleepHourTo = result.states.sleepTime.to.hour;
                var sleepMinuteTo = result.states.sleepTime.to.minute;
                res.status(200);
                res.send({  medicine: medicineHour+":"+medicineMinute,
                            sleepFrom: sleepHourFrom+":"+sleepMinuteFrom,
                            sleepTo: sleepHourTo+":"+sleepMinuteTo  });
            });
        }
   });
});

router.post('/', function(req, res) {
	console.log("Receive POST to /preferences");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML states file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML states file: " + err.message);
					res.status(400);
					res.send(err);
            	}
                var medicine = req.body.medicine;
                var sleepFrom = req.body.sleepFrom;
                var sleepTo = req.body.sleepTo;
                var regexMedicine = /(\d+):(\d+)/.exec(medicine);
                var regexSleepFrom = /(\d+):(\d+)/.exec(sleepFrom);
                var regexSleepTo = /(\d+):(\d+)/.exec(sleepTo);
                result.states.medicineTime.hour = regexMedicine[1];
                result.states.medicineTime.minute = regexMedicine[2];
                result.states.sleepTime.from.hour = regexSleepFrom[1];
                result.states.sleepTime.from.minute = regexSleepFrom[2]
                result.states.sleepTime.to.hour = regexSleepTo[1];
                result.states.sleepTime.to.minute = regexSleepTo[2]
                var builder = new xml2js.Builder();
        		var xmlText = builder.buildObject(result);
        		fs.writeFile(xmlFile, xmlText, function(err, data){
            		if (err) {
            			console.log("Error writing to XML states file: " + err.message);
            		}
            		console.log("Successfully update XML states file!");
       			})
       			res.status(200);
                res.send(req.body);
            });
        }
   });
});

router.get('/sleep-time', function(req, res) {
	console.log("Receive GET to /sleep-time");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML states file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML states file: " + err.message);
					res.status(400);
					res.send(err);
            	}
                var hourFrom = result.states.medicineTime.hour;
                var minuteFrom = result.states.medicineTime.minute;
                var hourTo = result.states.medicineTime.hour;
                var minuteTo = result.states.medicineTime.minute;
            	res.status(200);
                res.send({ from: hourFrom+":"+minuteFrom, to: hourTo+":"+minuteTo});
            });
        }
   });
});

router.post('/sleep-time', function(req, res) {
	console.log("Receive POST to /sleep-time");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML states file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML states file: " + err.message);
					res.status(400);
					res.send(err);
            	}
                var from = req.body.from;
                var to = req.body.to;
                var regexArrayFrom = /(\d+):(\d+)/.exec(from);
                var regexArrayTo = /(\d+):(\d+)/.exec(to);
                result.states.sleepTime.from.hour = regexArrayFrom[1];
                result.states.sleepTime.from.minute = regexArrayFrom[2]
                result.states.sleepTime.to.hour = regexArrayTo[1];
                result.states.sleepTime.to.minute = regexArrayTo[2]
                var builder = new xml2js.Builder();
        		var xmlText = builder.buildObject(result);
        		fs.writeFile(xmlFile, xmlText, function(err, data){
            		if (err) {
            			console.log("Error writing to XML states file: " + err.message);
            		}
            		console.log("Successfully update XML states file!"); 
       			}) 
       			res.status(200);
                res.send(req.body);
            });
        }
   });
});

module.exports = router;