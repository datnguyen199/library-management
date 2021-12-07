const { factory } = require('factory-girl');
const User = require('../../models/user');
const faker = require('faker');

factory.define('user', User, {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  phone: faker.phone.phoneNumber(),
  email: faker.internet.email(),
  password: 'Aa@123456',
  idNumber: Math.floor(10000000000 + Math.random() * 90000000000).toString(),
  dateOfBirth: faker.date.between('1999-01-01', '2021-12-31'),
  company: faker.company.companyName(),
  role: 'user',
  type: 'normal',
  favourites: []
});

factory.extend('user', 'admin', { role: 'admin' });
