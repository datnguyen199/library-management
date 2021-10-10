var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['available', 'borrowing', 'not available'],
      default: 'available'
    },
    price: {
      type: Number
    },
    book: {
      type: Schema.Types.ObjectId, required: true,
      ref: 'Book'
    }
  }
)

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
