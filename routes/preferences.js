var express = require('express');
var router = express.Router();
var statesRepository = require('../repositories/statesRepository')

router.get('/', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive GET to /mobile/preferences");

    statesRepository.respondStates(res, function(result) {
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
});

router.post('/', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive POST to /mobile/preferences");

    statesRepository.updatePreferences(req, res);
});

router.get('/medicine-time', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive GET to /mobile/preferences/medicine-time");

    statesRepository.respondStates(res, function(result) {
        var hour = result.states.medicineTime.hour;
        var minute = result.states.medicineTime.minute;
        res.status(200);
        res.send({ time: hour+":"+minute });
    });
});

router.post('/sleep-time', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive POST to /mobile/preferences/sleep-time");

    statesRepository.updateMedicineTime(req, res);
});

module.exports = router;