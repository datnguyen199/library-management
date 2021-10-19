const passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  User = require('../models/user');

require('dotenv').config();

let jwtOptions = {};
let passportConfig = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'jwt_scret_key';
jwtOptions.passReqToCallback = true;

passport.use(new JwtStrategy(jwtOptions, function(req, jwt_payload, done) {
  console.log(jwt_payload.id);
  User.findOne({ _id: jwt_payload.id }, function(err, user) {
    if(err) return done(err, false);
    if(user) {
      req.user = user;
      done(null, user);
    } else {
      done(null, false);
    }
  })
}))

passportConfig['passport'] = passport;
passportConfig['jwtOptions'] = jwtOptions;

module.exports = passportConfig;
