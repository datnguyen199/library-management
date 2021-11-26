const { factory } = require('factory-girl');
const BookInstance = require('../../models/bookInstance');

factory.define('bookinstance', BookInstance, {
  status: 'available',
  rating: 4,
  favouriteCount: 5,
  book: factory.assoc('Book', '_id')
});
