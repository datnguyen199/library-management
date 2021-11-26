var express = require('express');
var router = express.Router();
var schedule = require('../config/schedule');

/* GET home page. */
router.get('/', function(req, res, next) {
  schedule.scheduleNotifyReturnBook();
  res.status(200).send({ message: 'ok' });
});

module.exports = router;
