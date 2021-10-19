var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      maxLength: 255
    },
    user: {
      type: Schema.Types.ObjectId, required: true,
      ref: 'User'
    },
    bookInstance: {
      type: Schema.Types.ObjectId, required: true,
      ref: 'BookInstance'
    },
    parentComments: [{
      type: Schema.Types.ObjectId, required: true,
      ref: 'Comment'
    }]
  }
)

module.exports = mongoose.model('Comment', CommentSchema);
