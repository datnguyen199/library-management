var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['available', 'borrowing', 'not available'],
      default: 'available'
    },
    rating: {
      type: Number
    },
    favouriteCount: {
      type: Number,
      default: 0
    },
    book: {
      type: Schema.Types.ObjectId, required: true,
      ref: 'Book'
    }
  }
)

BookInstanceSchema.methods.updateFavouriteCount = function() {
  var bookInstance = this;

  return User.count({ favourites: { $in: [bookInstance._id] } }, function(err, count) {
    bookInstance.favouriteCount = count;

    return bookInstance.save();
  })
}

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
