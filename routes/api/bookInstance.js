var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var BookInstance = require('../../models/bookInstance');
var Comment = require('../../models/comment');
var passportConfig = require('../../config/passport');

router.post('/bookInstances', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user;
  if(currentUser.role != 'admin') return res.status(403).send({ message: 'only admin role' });

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

router.post('/bookInstances/:id/favourite', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user,
    bookInstanceId = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(bookInstanceId)) {
    return res.status(400).send({ message: 'book is not existed!' });
  }
  BookInstance.findOne({ _id: bookInstanceId }, function(err, bookInstance) {
    if(!bookInstance) { return res.status(400).send({ message: 'book is not existed!' }) };
    currentUser.favourite(bookInstanceId).then(function(user) {
      res.status(200).send({ message: 'success', data: user });
    })
  })
});

router.post('/bookInstances/:id/unfavourite', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user,
    bookInstanceId = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(bookInstanceId)) {
    return res.status(400).send({ message: 'book is not existed!' });
  }
  BookInstance.findOne({ _id: bookInstanceId }, function(err, bookInstance) {
    if(!bookInstance) { return res.status(400).send({ message: 'book is not existed!' }) };
    currentUser.unfavourite(bookInstanceId).then(function(user) {
      res.status(200).send({ message: 'success', data: user });
    })
  })
});

router.post('/bookInstances/:id/comments', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user,
    bookInstanceId = req.params.id;
  if(!mongoose.Types.ObjectId.isValid(bookInstanceId)) {
    return res.status(400).send({ message: 'book is not existed!' });
  }
  let bookInstance = await BookInstance.findOne({ _id: bookInstanceId }).exec();
  if(!bookInstance) { return res.status(400).send({ message: 'book is not existed!' }) };
  let content = req.body['comment'] && req.body['comment']['content'];
  let comment = new Comment({
    content: content,
    user: currentUser._id,
    bookInstance: bookInstance._id
  });
  try {
    await comment.save();
    return res.status(201).send({ message: comment });
  } catch(error) {
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(422).send(errors);
    }
    res.status(500).send({ message: error });
  }
});

router.post('/bookInstances/:id/comments/:comment_id/reply', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user,
    bookInstanceId = req.params.id,
    commentId = req.params.comment_id,
    content = req.body['comment'] && req.body['comment']['content'],
    bookInstance = null, parentComment = null;
  if(!mongoose.Types.ObjectId.isValid(bookInstanceId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).send({ message: 'not existed data!' });
  }
  Promise.all([
    BookInstance.findOne({ _id: bookInstanceId }).exec(),
    Comment.findOne({ _id: commentId }).exec()
  ]).then(async rs => {
    [bookInstance, parentComment] = rs;
    if(!bookInstance || !parentComment) return res.status(400).send({ message: 'not existed data!' });

    let parentCommentArray = parentComment.parentComments;
    parentCommentArray.push(parentComment._id);
    let comment = new Comment({
      content: content,
      user: currentUser._id,
      bookInstance: bookInstance._id,
      parentComments: parentCommentArray
    })
    try {
      await comment.save();
      return res.status(201).send({ message: comment });
    } catch(error) {
      if (error.name === 'ValidationError') {
        let errors = {};
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        });

        return res.status(422).send(errors);
      }
      res.status(500).send({ message: error });
    }
  }).catch(err => res.status(400).send({ message: err }));
});

module.exports = router;
