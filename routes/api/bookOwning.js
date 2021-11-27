var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var BookInstance = require('../../models/bookInstance');
var Borrow = require('../../models/borrow');
var BookBasket = require('../../models/bookBasket');
var passportConfig = require('../../config/passport');

router.post('/basket_adding/:bookInstanceId', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user;
  if(currentUser.role != 'user') return res.status(403).send({ message: 'not allow with this role!' });

  BookBasket.addBookToBasket(currentUser._id, req.params.bookInstanceId, function(err, result) {
    if(err) return res.status(400).send({ message: err });
    res.status(200).send({ message: 'add book successfull', data: result });
  })
});

router.post('/basket_removing/:bookInstanceId', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user,
    bookBasket = currentUser.bookBasket[0];
  if(currentUser.role != 'user') return res.status(403).send({ message: 'not allow with this role!' });
  if(!bookBasket || bookBasket.books.length < 1) return res.status(400).send({ message: 'Basket is empty!' });

  bookBasket.removeBookFromBasket(req.params.bookInstanceId).then(function (basket){
    res.status(200).send({ data: basket });
  })
});

router.get('/book_baskets', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user,
    bookBasket = currentUser.bookBasket[0];
  if(currentUser.role != 'user') return res.status(403).send({ message: 'not allow with this role!' });
  if(!bookBasket || bookBasket.books.length < 1) return res.status(200).send({ message: 'Basket is empty!' });

  BookBasket.findOne({ _id: currentUser.bookBasket[0].id }).lean()
    .populate({
      path: 'books',
      populate: { path: 'book' }
    }).exec(function(err, result) {
      if(err) return res.status(400).send({ message: err });
      res.status(200).send({ data: result });
    });
});

router.post('/borrowing', passportConfig.passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  let currentUser = req.user,
    bookBasket = currentUser.bookBasket[0];
  if(currentUser.role != 'user') return res.status(403).send({ message: 'User role is not valid!' });
  if(!bookBasket || bookBasket.books.length < 1) return res.status(400).send({ message: 'Basket is empty, please choose book before borrowing!' });

  const conn = await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true });
  const session = await conn.startSession();
  session.startTransaction();
  try {
    let { borrowDate, returnDate, notes } = req.body['borrowing'],
      bookArr = bookBasket.books;
    const borrowing = new Borrow({
      borrowDate: borrowDate,
      returnDate: returnDate,
      notes: notes,
      user: currentUser.id,
      bookInstances: bookArr
    });
    await borrowing.save({ session: session });
    await BookBasket.deleteOne({ _id: bookBasket._id }, { session: session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).send({ data: borrowing });
  } catch(err) {
    console.log(err);
    session.endSession();
    if(err.name == 'ValidationError') {
      res.status(422).send({ message: err.errors });
    } else {
      res.status(500).send({ message: err });
    }
  }
})

module.exports = router;
