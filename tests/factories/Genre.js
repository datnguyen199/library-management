const { factory } = require('factory-girl');
const Genre = require('../../models/genre');

factory.define('genre', Genre, {
  name: factory.sequence('Genre.name', n => `Genre ${n}`),
  description: factory.chance('name')
});
