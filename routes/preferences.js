var express = require('express');
var router = express.Router();
var db = require("../db");
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
var xmlFile = __dirname + "/../preferences.xml";

router.get('/medicine-time', function(req, res) {
	console.log("Receive GET to /medicine-time");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML preferences file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML preferences file: " + err.message);
					res.status(400);
					res.send(err);
            	}
            	res.status(200);
                res.send(result['preferences']['medicineTime']);
            });
        }
   });
});

router.post('/medicine-time', function(req, res) {
	console.log("Receive POST to /medicine-time");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML preferences file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML preferences file: " + err.message);
					res.status(400);
					res.send(err);
            	}
                result.preferences.medicineTime.hour = req.body.hour;
                result.preferences.medicineTime.minute = req.body.minute;
                var builder = new xml2js.Builder();
        		var xmlText = builder.buildObject(result);
        		fs.writeFile(xmlFile, xmlText, function(err, data){
            		if (err) {
            			console.log("Error writing to XML preferences file: " + err.message);
            		}
            		console.log("Successfully update XML preferences file!");
       			})
       			res.status(200);
                res.send(result['preferences']['medicineTime']);
            });
        }
   });
});

router.get('/sleep-time', function(req, res) {
	console.log("Receive GET to /sleep-time");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML preferences file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML preferences file: " + err.message);
					res.status(400);
					res.send(err);
            	}
            	res.status(200);
                res.send(result['preferences']['sleepTime']);
            });
        }
   });
});

router.post('/sleep-time', function(req, res) {
	console.log("Receive POST to /sleep-time");

	fs.readFile(xmlFile, "utf-8", function (err, text) {
        if (err) {
        	console.log("Error reading XML preferences file: " + err.message);
			res.status(400);
			res.send(err);
        } else {
            parser.parseString(text, function (err, result) {
            	if (err) {
            		console.log("Error parsing XML preferences file: " + err.message);
					res.status(400);
					res.send(err);
            	}
                result.preferences.sleepTime.to.hour = req.body.to.hour;
                result.preferences.sleepTime.to.minute = req.body.to.minute;
                result.preferences.sleepTime.from.hour = req.body.from.hour;
                result.preferences.sleepTime.from.minute = req.body.from.minute;
                var builder = new xml2js.Builder();
        		var xmlText = builder.buildObject(result);
        		fs.writeFile(xmlFile, xmlText, function(err, data){
            		if (err) {
            			console.log("Error writing to XML preferences file: " + err.message);
            		}
            		console.log("Successfully update XML preferences file!");
       			})
       			res.status(200);
                res.send(result['preferences']['sleepTime']);
            });
        }
   });
});

module.exports = router;