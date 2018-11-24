var express = require('express');
var router = express.Router();
var moment = require('moment');
var statesRepository = require('../repositories/statesRepository')
var sensorsRepository = require('../repositories/sensorsRepository')

router.get('/home-status', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive GET to /home-status");

  statesRepository.respondStates(res, function(result) {
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
});

router.get('/last-movement', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive GET to /last-movement");

  sensorsRepository.getLastMovementRegistry(function(err, post) {
    if(err) {
      console.log("[" + (new Date()).toLocaleString() + "] " + "Some error happened when returning last movement: " + err.message);
      res.status(400);
      res.send(err);
    } else if (post !== null) {
      res.send({ time: moment(post.createdDate).format('MMM DD, YYYY HH:mm') });
    } else {
      res.send({ time: res.__("NO_LAST_MOVEMENT") });
    }
  });
});

router.get('/last-medicine', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive GET to /last-medicine");

  sensorsRepository.getLastMedicineRegistry(function(err, post) {
    if(err) {
      console.log("[" + (new Date()).toLocaleString() + "] " + "Some error happened when returning last medicine: " + err.message);
      res.status(400);
      res.send(err);
    } else if (post !== null) {
      res.send({ time: moment(post.createdDate).format('MMM DD, YYYY HH:mm') });
    } else {
      res.send({ time: res.__("NO_MEDICINE_DETECTED") });
    }
  });
});

router.get('/last-fall', function(req, res) {
	console.log("[" + (new Date()).toLocaleString() + "] " + "Receive GET to /last-fall");

  sensorsRepository.getLastFallRegistry(function(err, post) {
    if(err) {
      console.log("[" + (new Date()).toLocaleString() + "] " + "Some error happened when returning last fall: " + err.message);
      res.status(400);
      res.send(err);
    } else if (post !== null) {
      res.send({ time: moment(post.createdDate).format('MMM DD, YYYY HH:mm') });
    } else {
      res.send({ time: res.__("NO_FALL_DETECTED") });
    }
  });
});

module.exports = router;