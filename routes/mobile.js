var express = require('express');
var router = express.Router();
var db = require("../db");
var moment = require('moment');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
var xmlFile = __dirname + "/../states.xml";

var Sensors = db.Mongoose.model('sensors', db.SensorSchema, 'sensors');

router.get('/home-status', function(req, res) {
	console.log("Receive GET to /home-status");

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
                var numberOfPeople = result.states.numberOfPeople;
                if(numberOfPeople == 1) {
                	var status = res.__("STATUS_ALONE");
                } else if (numberOfPeople <= 0) {
                	var status = res.__("STATUS_NOT_HOME");
                } else {
                	var status = res.__n("STATUS_WITH_VISITOR", "STATUS_WITH_VISITORS", numberOfPeople-1);
                }
                res.status(200);
                res.send({  status: status });
            });
        }
   });
});

router.get('/last-movement', function(req, res) {
	console.log("Receive GET to /last-movement");

	Sensors.findOne().or([
          { $and: [{type: "movement"}, {info: "moving"}] },
          { $and: [{type: "passage"}, {info: "hall"}] }
      ]).sort({createdDate: -1}).exec(function(err, post){
      	if (post !== null) {
      		moment.locale("pt-br");
      		res.send({ time: moment(post.createdDate).format('lll') });
      	} else {
      		res.send({ time: res.__("NO_LAST_MOVEMENT") });
      	}
    	
	});
});

router.get('/last-medicine', function(req, res) {
	console.log("Receive GET to /last-medicine");

	Sensors.findOne({ $and: [{type: "door"}, {info: "medicine"}] })
			.sort({createdDate: -1}).exec(function(err, post){
      	if (post !== null) {
      		moment.locale("pt-br");
      		res.send({ time: moment(post.createdDate).format('lll') });
      	} else {
      		res.send({ time: res.__("NO_MEDICINE_DETECTED") });
      	}
    	
	});
});

router.get('/last-fall', function(req, res) {
	console.log("Receive GET to /last-fall");

	Sensors.findOne({ $and: [{type: "moviment"}, {info: "fall"}] })
			.sort({createdDate: -1}).exec(function(err, post){
      	if (post !== null) {
      		moment.locale("pt-br");
      		res.send({ time: moment(post.createdDate).format('lll') });
      	} else {
      		res.send({ time: res.__("NO_FALL_DETECTED") });
      	}
    	
	});
});

module.exports = router;