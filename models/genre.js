var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GenreSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'please enter name'],
      maxLength: [200, 'Max length is 200, got {VALUE}']
    },
    description: { type: String, required: true, maxLength: 1000 }
  }
)

module.exports = mongoose.model('Genre', GenreSchema);
