var mongoose = require('mongoose');
const Author = require('./author');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  title: {
    type: String,
    required: [true, 'please enter title'],
    get: capitalizeFirstLetter
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
  authors: [{
    type: Schema.Types.ObjectId, required: true,
    ref: 'Author'
  }],
  genres: [{
    type: Schema.Types.ObjectId, required: true,
    ref: 'Genre'
  }],
  images: [{
    type: Schema.Types.ObjectId, required: true,
    ref: 'Image'
  }]
})

function capitalizeFirstLetter(v) {
  return v.charAt(0).toUpperCase() + v.substr(1);
}

BookSchema.statics.findByTitle = function(title) {
  return this.find({ title: new RegExp(title, 'i') })
}

BookSchema.query.searchByAuthor = function(searchKey, lastNameSearch, callback) {
  // filter condition of book first here
  let query = this.find({ title: new RegExp('book', 'i') });

  Author.find({
    $or: [{ firstName: new RegExp(searchKey, 'i') }, { lastName: new RegExp(lastNameSearch, 'i') }]
  }, function(err, authors) {
    // filter where and with others
    query.where({'authors': { $in: authors.map(author => author.id)}}).exec(callback);
  })

  return query;
}

// BookSchema.post('save', function() {
//   console.log('post save!');
//   throw new Error('something went wrong!');
// });

module.exports = mongoose.model('Book', BookSchema);
