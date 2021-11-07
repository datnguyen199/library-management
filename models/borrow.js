var mongoose = require('mongoose');
const moment = require('moment');
var Schema = mongoose.Schema;

var BorrowSchema = new Schema({
  borrowDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: function(value) {
          return moment(new Date(this.borrowDate)).isBefore(moment(new Date(value)));
        },
        message: 'please enter borrow date less than return date'
      }
    ]
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['borrowing', 'returned', 'cancelled'],
    default: 'borrowing'
  },
  notes: {
    type: String
  },
  user: {
    type: Schema.Types.ObjectId, required: true,
    ref: 'User'
  },
  bookInstances: [{
    type: Schema.Types.ObjectId, required: true,
    ref: 'BookInstance'
  }]
}, { optimisticConcurrency: true })

module.exports = mongoose.model('Borrow', BorrowSchema);
