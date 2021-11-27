var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookBasket = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  books: [{
    type: Schema.Types.ObjectId,
    ref: 'BookInstance'
  }]
})

BookBasket.statics.addBookToBasket = function(userId, bookInstanceId, callback) {
  const self = this;
  self.findOne({ user: userId }, (err, basket) => {
    if (basket){
      let bookArr = basket.books;
      if(bookArr.includes(bookInstanceId)) return callback('Book already added!', null);

      bookArr.push(bookInstanceId);
      self.findOneAndUpdate({ user: userId }, { books: bookArr }, { new: true }, (err, result) => {
        return callback(err, result);
      });
    } else {
      self.create({ user: userId, books: [bookInstanceId] }, (err, result) => {
        return callback(err, result);
      });
    }
  });
}

BookBasket.methods.removeBookFromBasket = function(bookInstanceId) {
  this.books.remove(bookInstanceId);

  return this.save();
}

module.exports = mongoose.model('BookBasket', BookBasket);
