var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('../models/user');

require('dotenv').config();

module.exports = function(passport) {
  var options = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = 'jwt_scret_key';
  passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    User.findOne({ id: jwt_payload.id }, function(err, user) {
      if(err) return done(err, false);
      if(user) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
  }))
}
