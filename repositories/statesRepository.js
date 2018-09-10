var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
var xmlFile = __dirname + '/../states.xml';

module.exports = {

	getStates: function(callback) {
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
	            	callback(result);
	            });
	        }
	   });
	},

	respondStates: function(res, callback) {
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
	            	callback(result);
	            });
	        }
	   });
	},

	updateNumberOfPeople: function(update) {
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
	},

	updatePreferences: function(req, res) {
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
	},

	updateMedicineTime: function(req, res) {
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
	}
}