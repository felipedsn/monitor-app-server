var express = require('express');
var router = express.Router();
var db = require("../db");

/* Insert sensor notification in database */
router.post('/', function(req, res) {
	console.log("Receive POST to /sensors: " + req.body);

	var type =  req.body.type;
	var info = req.body.info;

	//Validate values
	if(type == "door") {
		if (info !== "main" && info !== "medicine") {
			res.status(400);
			res.send({ error: "Invalid info for the type door"});
			return;
		}
	} else if (type == "passage") {
		if (info !== "main" && info !== "hall") {
			res.status(400);
			res.send({ error: "Invalid info for the type passage"});
			return;
		}
	} else if (type == "moviment") {
		if (info !== "moving" && info !== "fall") {
			res.status(400);
			res.send({ error: "Invalid info for the type moviment"});
			return;
		}
	}

	var Sensors = db.Mongoose.model('sensors', db.SensorSchema, 'sensors');
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