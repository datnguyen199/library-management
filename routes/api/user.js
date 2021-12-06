var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var jwt = require('jsonwebtoken');
var passportConfig = require('../../config/passport');

require('dotenv').config();

router.post('/sign_up', function(req, res, next) {
  try {
    let user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      idNumber: req.body.idNumber,
      dateOfBirth: req.body.dateOfBirth,
      company: req.body.company,
      role: req.body.role
    })

    user.save(function(err, user) {
      if(err) res.status(422).send({ errors: err.errors });
      else res.status(201).send({ data: user });
    });
  } catch(err) {
    res.status(500).send({ errors: err });
  }
});

router.post('/sign_in', function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if(err) return res.status(500).send({ message: err });
    if(!user) return res.status(401).send({ message: 'email or password not valid!' });
    user.comparePassword(req.body.password, function(err, isMatch) {
      if(isMatch && !err) {
        let payload = { id: user._id };
        var token = jwt.sign(payload, 'jwt_scret_key');
        res.status(200).send({
          message: 'login successfull',
          accessToken: token
        });
      } else {
        res.status(401).send({ message: 'email or password not valid!' });
      }
    })
  })
})

router.get('/auth/google', passportConfig.passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/auth/google/callback', passportConfig.passport.authenticate('google'), (req, res) => {
  res.status(200).send({ message: 'login success', user: req.user });
});

router.get('/current_user', (req, res) => {
  res.status(200).send(req.user);
});

router.get('/protected', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user;
  res.status(200).send({ message: currentUser });
});

module.exports = router;
