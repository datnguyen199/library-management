var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Book = require('../../models/book');
var Genre = require('../../models/genre');
var Author = require('../../models/author');
var BookInstance = require('../../models/bookInstance');

router.post('/books', async function(req, res, next) {
  const conn = await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true });
  // TODO: create collection books and authors if not exist
  // Author.createCollection();
  // Book.createCollection();
  const session = await conn.startSession();
  session.startTransaction();
  try {
    let authorParams = req.body['author'],
      bookParams = req.body['book'],
      genreParams = req.body['genre'],
      authorArr = [], genreArr = [],
      authorIds = [], genreIds = [];

    authorParams.forEach(function(value) {
      if(value['id'] !== undefined) authorIds.push(value['id']);
      else authorArr.push(value);
    })
    const authors = await Author.create(authorArr, { session: session })

    genreParams.forEach(function(value) {
      if(value['id'] !== undefined) genreIds.push(value['id']);
      else genreArr.push(value);
    })
    const genres = await Genre.create(genreArr, { session: session })

    authors.forEach(author => authorIds.push(author.id));
    genres.forEach(genre => genreIds.push(genre.id));

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

router.get('/books', async function(req, res, next) {
  let perPage = parseInt(req.query.per), page = parseInt(req.query.page);
  Book.find({}, null, { skip: (page - 1) * perPage })
    .limit(perPage).sort({ title: 1 })
    .populate({ path: 'authors' }).populate({ path: 'genres' })
    .exec(function(err, result) {
      if(err) res.status(400).send({ message: err })
      else res.status(200).send({ data: result });
    })
  // let bookLean = await Book.findOne().lean();
  // res.status(200).send({ data: bookLean });
});

router.put('/books/:id', function(req, res, next) {
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

router.delete('/books/:id', function(req, res, next) {
  Book.findOneAndDelete({id: req.query.id }, { useFindAndModify: false, rawResult: true }, function(err, result) {
    if(err) res.status(400).send({ message: err });
    else if(result['value'] == null) res.status(404).send({ message: 'Record not found' });
    else res.status(200).send({ message: `delete book with id=${result['value']['_id']} successfull!` });
  });
});

router.get('/book_searching', function(req, res, next) {
  // let filter = { title: { $regex: req.query.searchKeyword, $options: 'i' } }
  // Book.find()
  //   .populate({ path: 'authors', select: 'firstName lastName' }).populate({ path: 'genres' })
  //   .searchByAuthor(req.query.searchKeyword, 'ln',
  //   // .populate({path: 'authors', select: 'firstName lastName', perDocumentLimit: 1 }).populate({ path: 'genres' })
  //   function(err, result) {
  //   if(err) res.status(400).send({ message: err });
  //   else res.status(200).send({ data: result })
  // })
  let searchKey = req.query.searchKey;
  let limit = req.query.limit == undefined ? 10 : parseInt(req.query.limit);
  let page = req.query.page == undefined ? 1 : parseInt(req.query.page);
  let filter = {
    $or: [
      { 'book.title': new RegExp(searchKey, 'i') },
      { 'book.publisher': new RegExp(searchKey, 'i') },
      { 'book.authors.firstName': new RegExp(searchKey, 'i') },
      { 'book.authors.lastName': new RegExp(searchKey, 'i') },
      { 'book.genres.name': new RegExp(searchKey, 'i') }
    ],
  }

  let sort = {
    _id: 1
  }

  // if(req.query.sortRating)
  sort = Object.assign({ 'book.ratingAvarage': 1 }, sort);
  console.log('sort: ' + JSON.stringify(sort));

  if(req.query.ratingAvarage !== undefined) {
    filter = Object.assign(filter, { 'book.ratingAvarage': { $eq: parseInt(req.query.ratingAvarage) } });
  }

  BookInstance.aggregate([
    {
      $lookup: {
        from: 'books',
        let: { bookId: '$book' },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$bookId"] } } },
          {
            $lookup: {
              from: 'authors',
              localField: 'authors',
              foreignField: '_id',
              as: 'authors'
            },
          },
          {
            $lookup: {
              from: 'genres',
              localField: 'genres',
              foreignField: '_id',
              as: 'genres'
            }
          }
        ],
        as: 'book',
      }
    },
    { $unwind: { path: '$book', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$book.authors', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$book.genres', preserveNullAndEmptyArrays: true } },
    { $match: filter },
    {
      $group: { '_id' : '$_id' }
    }
  ]).skip((page - 1 ) * limit).limit(limit).exec(async function(err, result) {
    if(err){ res.status(500).send({ message: err }) }
    else {
      let bookInstances = await BookInstance.find({ _id: result.map(rs => rs['_id']) })
        .populate({
          path: 'book',
          populate: [ { path: 'authors' }, { path: 'genres' } ]
        }).sort(sort).lean().exec();
      res.status(200).send({ data: bookInstances });
    }
  });

  // Book.aggregate([
  //   {
  //     $lookup: {
  //       from: 'authors',
  //       localField: 'authors',
  //       foreignField: '_id',
  //       as: 'authors'
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'genres',
  //       localField: 'genres',
  //       foreignField: '_id',
  //       as: 'genres'
  //     }
  //   },
  //   { $unwind: { path: '$authors', preserveNullAndEmptyArrays: true } },
  //   { $unwind: { path: '$genres', preserveNullAndEmptyArrays: true } },
  //   {
  //     $match: filter
  //   },
  //   {
  //     $group: { '_id' : '$_id', info: { $push: '$$ROOT' } }
  //   },
  //   {
  //     $replaceRoot: { newRoot: { $mergeObjects: '$info' } }
  //   },
  //   {
  //     $project: { info: 0, authors: 0, genres: 0 }
  //   }
  // ]).skip((page - 1 ) * limit).limit(limit).sort(sort).exec(async function(err, result) {
  //   let books = await Book.find({ _id: result.map(rs => rs['_id']) }).populate('authors').populate('genres').lean().exec();
  //   res.status(200).send({ data: books });
  // });
})

module.exports = router;
