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
    type: Number
  },
  author: {
    type: Schema.Types.ObjectId, required: true,
    ref: 'Author'
  },
  genre: {
    type: Schema.Types.ObjectId, required: true,
    ref: 'Genre'
  },
  image: {
    type: Schema.Types.ObjectId, required: true,
    ref: 'Image'
  }
})

module.exports = mongoose.model('Book', BookSchema);
