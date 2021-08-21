var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date
    },
    dateOfDeath: {
      type: Date
    },
    summary: {
      type: String,
      maxLength: 1000
    }
  }
)

module.exports = mongoose.model('Author', AuthorSchema);
