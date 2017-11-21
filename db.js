//mongod --dbpath ~/Documents/TCC/server/data

var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost:27017/monitorapp', { useMongoClient: true });

var sensorSchema = new mongoose.Schema({
	type : {
		type: String,
		enum: ['door', 'passage', 'moviment']
	},
	createdDate: {
    	type: Date,
    	default: Date.now
	},
    info : {
		type: String,
		enum: ['main', 'medicine', 'hall', 'moving', 'fall']
	}
}, { collection: 'sensors' }
);


module.exports = { Mongoose: mongoose, SensorSchema: sensorSchema }