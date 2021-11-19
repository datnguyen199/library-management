var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
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
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
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
          return v.length <= 255
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
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    favourites: [{
      type: Schema.Types.ObjectId, ref: 'BookInstance'
    }],
  }
)

UserSchema.pre('save', function(next) {
  var user = this;
  if(this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function(err, salt) {
      if(err) return next(err);
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if(err) return next(err);
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
});

UserSchema.methods.comparePassword = function(password, next) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if(err) return next(err);
    next(null, isMatch);
  })
}

UserSchema.methods.favourite = function(bookInstanceId) {
  if(this.favourites.indexOf(bookInstanceId) < 0) {
    this.favourites.push(bookInstanceId);
  }

  return this.save();
}

UserSchema.methods.unfavourite = function(bookInstanceId){
  this.favourites.remove(bookInstanceId);

  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
