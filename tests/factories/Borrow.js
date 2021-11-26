const { factory } = require('factory-girl');
const Borrow = require('../../models/borrow');
const faker = require('faker');

factory.define('borrow', Borrow, {
  borrowDate: new Date(),
  returnDate: new Date() + 1,
  notes: faker.lorem.sentence(),
  status: 'borrowing',
  user: factory.assoc('User', '_id'),
  bookInstances: factory.assocMany('BookInstance', 2, '_id')
});
