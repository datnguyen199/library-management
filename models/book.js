var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  title: {
    type: String,
    required: [true, 'please enter title']
  },
  description: {
    type: String,
    required: true
  },
  publishYear: {
    type: Date,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  numberOfPublish: {
    type: String
  },
  ratingAvarage: {
    type: Number,
    default: 0
  },
  authors: {
    type: [{
      type: Schema.Types.ObjectId, required: true,
      ref: 'Author'
    }],
    validate: [(val) => val.length >= 1, 'Must have at least 1 author']
  },
  genres: {
    type: [{
      type: Schema.Types.ObjectId, required: true,
      ref: 'Genre'
    }],
    validate: [(val) => val.length >= 1, 'Must have at least 1 genre']
  },
  images: [{
    type: Schema.Types.ObjectId, required: true,
    ref: 'Image'
  }]
})

module.exports = mongoose.model('Book', BookSchema);
