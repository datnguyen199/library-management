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
    enum: ['waiting_confirm', 'borrowing', 'returned', 'cancelled'],
    default: 'waiting_confirm'
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
})

BorrowSchema.statics.findWithUserADayBeforeReturn = function(today) {
  let tommorow = today.setDate(today.getDate() + 1);
  return this.find({ returnDate: tommorow }, 'user').populate([
    { path: 'user', select: 'firstName lastName email' },
    {
      path: 'bookInstances', select: '_id', populate: {
        path: 'book', select: 'title _id'
      }
    }
  ]);
}

module.exports = mongoose.model('Borrow', BorrowSchema);
