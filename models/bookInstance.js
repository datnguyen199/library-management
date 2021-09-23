var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
  {
    status: {
      type: String,
      enum: {
        value: ['available', 'borrowing', 'not available'],
        message: '{VALUE} is not valid'
      }
    },
    rating: {
      type: Number
    },
    book: {
      type: Schema.Types.ObjectId, required: true,
      ref: 'Book'
    }
  }
)

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
