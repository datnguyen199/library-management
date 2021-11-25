var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Book = require('../../models/book');
var Genre = require('../../models/genre');
var Author = require('../../models/author');
var passportConfig = require('../../config/passport');

router.post('/books', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user;
  if(currentUser.role != 'admin') return res.status(403).send({ message: 'only admin role' });

  const conn = await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true });
  // TODO: create collection books and authors if not exist
  // Author.createCollection();
  // Book.createCollection();
  const session = await conn.startSession();
  session.startTransaction();
  try {
    let authorParams = req.body['authors'],
      bookParams = req.body['book'],
      genreParams = req.body['genres'],
      authorArr = [], genreArr = [],
      authorIds = [], genreIds = [];

    authorParams.forEach(function(value) {
      if(value['id'] !== undefined) authorIds.push(value['id']);
      else authorArr.push(value);
    })

    if(authorArr.length > 0) {
      const authors = await Author.create(authorArr, { session: session });
      authors.forEach(author => authorIds.push(author.id));
    }

    genreParams.forEach(function(value) {
      if(value['id'] !== undefined) genreIds.push(value['id']);
      else genreArr.push(value);
    })
    if(genreArr.length > 0) {
      const genres = await Genre.create(genreArr, { session: session })
      genres.forEach(genre => genreIds.push(genre.id));
    }
    const book = await Book.create([{
      title: bookParams['title'],
      description: bookParams['description'],
      publishYear: bookParams['publishYear'],
      publisher: bookParams['publisher'],
      numberOfPublish: bookParams['numberOfPublish'],
      authors: authorIds,
      genres: genreIds
    }], { session: session })
    await session.commitTransaction();
    session.endSession();

    res.status(200).send({ data: book });
  } catch(err) {
    console.log(err);
    session.endSession();
    if(err.name == 'ValidationError') {
      res.status(422).send({ message: err.errors });
    } else {
      res.status(500).send({ message: err });
    }
  }
});

router.get('/books', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user;
  if(currentUser.role != 'admin') return res.status(403).send({ message: 'only admin role' });

  let perPage = parseInt(req.query.per), page = parseInt(req.query.page);
  Book.find({}, null, { skip: (page - 1) * perPage })
    .limit(perPage).sort({ title: 1 })
    .select('title description authors genres').exec(function(err, result) {
      if(err) res.status(400).send({ message: err })
      else res.status(200).send({ data: result });
    })
});

router.put('/books/:id', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user;
  if(currentUser.role != 'admin') return res.status(403).send({ message: 'only admin role' });

  let bookParams = req.body['book'], updateParams = {
    title: bookParams['title'],
    description: bookParams['description'],
    publishYear: bookParams['publishYear'],
    publisher: bookParams['publisher'],
    numberOfPublish: bookParams['numberOfPublish'],
    authors: bookParams['authors'],
    genres: bookParams['genres']
  }

  Book.findOneAndUpdate({ id: req.query.id }, updateParams, {
   new: true, sort: { title: -1 }, useFindAndModify: false
  }).exec(function(err, result) {
    if(err) res.status(400).send({ message: err })
    else if (result == null) res.status(404).send({ message: 'Record not found' });
    else res.status(200).send({ data: result });
  })
});

router.delete('/books/:id', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user;
  if(currentUser.role != 'admin') return res.status(403).send({ message: 'only admin role' });

  Book.findOneAndDelete({id: req.query.id }, { useFindAndModify: false, rawResult: true }, function(err, result) {
    if(err) res.status(400).send({ message: err });
    else if(result['value'] == null) res.status(404).send({ message: 'Record not found' });
    else res.status(200).send({ message: `delete book with id=${result['value']['_id']} successfull!` });
  });
});

module.exports = router;
