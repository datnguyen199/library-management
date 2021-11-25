const { factory } = require('factory-girl');
const Author = require('../../models/author');
const faker = require('faker');

factory.define('author', Author, {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  dateOfBirth: faker.date.between('1975-01-01', '2000-12-31'),
  summary: faker.lorem.sentences(2)
});
