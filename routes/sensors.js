var express = require('express');
var router = express.Router();
var db = require("../db");

/* Insert sensor notification in database */
router.post('/', function(req, res) {
	console.log("Receive POST: " + req.body);

	var type =  req.body.type;
	var info = req.body.info;
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