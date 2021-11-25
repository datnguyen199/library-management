const { factory } = require('factory-girl');
const Image = require('../../models/image');
const faker = require('faker');

factory.define('image', Image, {
  url: faker.image.avatar()
});
