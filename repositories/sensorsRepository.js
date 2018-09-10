var db = require('../db');

var Sensors = db.Mongoose.model('sensors', db.SensorSchema, 'sensors');

module.exports = {

	getLastMainRegistry: function(callback) {
		Sensors.findOne().or([
			{ $and: [{type: "door"}, {info: "main"}] },
			{ $and: [{type: "passage"}, {info: "main"}] }
	    ]).sort({createdDate: -1}).exec(function(err, post){
	    	callback(err, post);
		});
	},

	getLastMovementRegistry: function(callback) {
	    Sensors.findOne().or([
			{ $and: [{type: "movement"}, {info: "moving"}] },
			{ $and: [{type: "passage"}, {info: "hall"}] }
	    ]).sort({createdDate: -1}).exec(function(err, post){
	      	callback(err, post);
		});
	},

	getLastMedicineRegistry: function(callback) {
		Sensors.findOne({ $and: [{type: "door"}, {info: "medicine"}] 
		}).sort({createdDate: -1}).exec(function(err, post) {
			callback(err, post);
		});
	},

	getLastFallRegistry: function(callback) {
		Sensors.findOne({ $and: [{type: "movement"}, {info: "fall"}]
		}).sort({createdDate: -1}).exec(function(err, post){
			callback(err,post);	
		});
	},

	save: function(post, callback) {
		var sensor = new Sensors(post);
		sensor.save(function (err) {
			callback(err);
		});
	}
}