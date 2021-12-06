const passport = require('passport'),
  JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  User = require('../models/user'),
  GoogleStrategy = require("passport-google-oauth20").Strategy;

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

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('accesstoken is: ', accessToken);
      console.log('user profile is: ', profile)
      const id = profile.id,
        email = profile.emails[0].value,
        firstName = profile.name.familyName,
        lastName = profile.name.givenName,
        profilePhoto = profile.photos[0].value;
      const currentUser = await User.findOne({ email: email });
      if(currentUser) {
        return done(null, currentUser);
      } else {
        let user = new User({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: '1234567890',
          password: 'Aa@123456',
          idNumber: '12345678910',
          role: 'user'
        })
        await user.save();
        return done(null, user);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const currentUser = await User.findOne({ id });
  done(null, currentUser);
});

passportConfig['passport'] = passport;
passportConfig['jwtOptions'] = jwtOptions;

module.exports = passportConfig;
