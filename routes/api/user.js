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

router.get('/users', function(req, res, next) {
  User.find().then(rs => res.status(200).send(rs));
});

router.put('/users/:id', async function(req, res, next) {
  let rs = await User.findOneAndUpdate(
    { email: 'xxxx' },
    { lastName: 'this is update last name' },
    { new: true, upsert: true }
  )
  console.log(rs);
  res.status(201).send({ message: 'save successfull!' });
  // let user = await User.findOne({ _id: req.params.id });
  // console.log('==================>' + req.params.id);
  // if(!user) res.status(401).send({ message: 'User not found!' });

  // user.firstName = 'this is new first name';
  // user.save(function(err, user) {
  //   res.status(201).send({ message: 'save successfull!' });
  // });
})

router.delete('/users/:id', async function(req, res, next) {
  User.findByIdAndRemove({ _id: req.params.id }, { rawResult: true }, function(err, user) {
    if(!user) res.status(404).send({ message: 'User not found' });
    else if(err) res.status(422).send({ message: err });
    else res.status(201).send({ message: `Deleted success user with id = ${user['value']['_id']}` });
  })
});

router.get('/protected', passportConfig.passport.authenticate('jwt', { session: false }), function(req, res, next) {
  let currentUser = req.user;
  res.status(200).send({ message: currentUser });
});

module.exports = router;
