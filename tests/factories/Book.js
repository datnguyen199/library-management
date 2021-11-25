const { factory } = require('factory-girl');
const Book = require('../../models/book');
const faker = require('faker');

factory.define('book', Book, {
  title: factory.sequence('Book.title', n => `Book ${n}`),
  description: faker.lorem.sentence(),
  publishYear: faker.date.between('1999-01-01', '2019-12-31'),
  publisher: factory.sequence('Book.publisher', n => `Publisher ${n}`),
  numberOfPublish: 1,
  authors: factory.assoc('Author', '_id'),
  genres: factory.assoc('Genre', '_id'),
  images: factory.assocMany('Image', 2, '_id')
});
