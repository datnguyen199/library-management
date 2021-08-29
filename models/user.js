var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return regexEmail.test(v);
        },
        message: props => `${props.value} is not a valid email`
      },
      required: [true, 'please enter your email']
    },
    password: {
      type: String,
      required: [true, 'please enter your password'],
      validate: [{
        validator: function(v) {
          return v.length <= 10
        },
        message: props => `Password max length is 255 characters`
      }, {
        validator: function(v) {
          let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
          return regexPassword.test(v);
        },
        message: props => `Password is not valid value`
      }]
    },
    idNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d+$/.test(v) && v.length == 11;
        },
        message: props => `${props.value} is not a valid value`
      }
    },
    dateOfBirth: {
      type: Date
    },
    company: {
      type: String
    }
  }
)

module.exports = mongoose.model('User', UserSchema);
