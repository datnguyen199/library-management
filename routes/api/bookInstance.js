var express = require('express');
var router = express.Router();
var BookInstance = require('../../models/bookInstance');

router.post('/bookInstances', async function(req, res, next) {
  let bookInstanceParams = req.body['bookInstance'];

  BookInstance.create({
    price: bookInstanceParams['price'],
    book: bookInstanceParams['book']
  }, function(err, bookInstance) {
    if(err && err.name == 'ValidationError') {
      res.status(422).send({ message: err.errors });
    } else if (err && err.name != 'ValidationError') {
      res.status(500).send({ message: err.errors });
    } else {
      res.status(201).send({ data: bookInstance })
    }
  })
});

module.exports = router;
