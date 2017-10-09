var CONSTANTS = require("./CONSTANTS");
var db = require("./db");  

var isHome;

function initStates() {
	//Init isHome, etc...
}

function verifyReturnHome() {

}

function verifyIdleness() {

}

function verifyMedicineTime() {

}

function sendPushNotification() {
	
}

function verifyEvents() {
	verifyReturnHome();
	verifyMedicineTime();
	if(isHome) {
		verifyIdleness();
	}

	console.log("OIEEE");
}

module.exports = function(){
	initStates();
	setInterval(function(){ 
		verifyEvents(); 
	}, CONSTANTS.EVENT_VERIFIER_INTERVAL);
}
