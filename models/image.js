var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true
    }
  }
)

module.exports = mongoose.model('Image', ImageSchema);
