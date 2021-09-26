var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BorrowSchema = new Schema({
  borrowDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: {
      value: ['borrowing', 'returned', 'cancelled'],
      message: '{VALUE} is not valid'
    }
  },
  notes: {
    type: String
  },
  user: {
    type: Schema.Types.ObjectId, required: true,
    ref: 'User'
  },
  bookInstance: [{
    type: Schema.Types.ObjectId, required: true,
    ref: 'BookInstance'
  }]
})

module.exports = mongoose.model('Borrow', BorrowSchema);
