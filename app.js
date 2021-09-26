var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var userApiRouter = require('./routes/api/user');
var bookApiRouter = require('./routes/api/book');

var app = express();

var mongoDBUrl = process.env.MONGODB_URL;

// try {
//   mongoose.connect(mongoDBUrl, { useNewUrlParser: true , useUnifiedTopology: true});
//   console.log('connect mongoDB successfull!');
// } catch (error) {
//   console.log(error);
// }

mongoose
 .connect(mongoDBUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        serverSelectionTimeoutMS: 20000 })
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'MongoDB connection error:'));

// conn.on('open', function () {
//   conn.db.listCollections().toArray(function (err, collectionNames) {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(collectionNames);
//   });
// });

// let Genre = require('./models/genre');
// Genre.create({ name: 'Fiction', description: 'this is description of fiction' }, function(err, genre) {
//   if(err) console.log(err)
//   else console.log('create genre success');
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/api/v1', userApiRouter);
app.use('/api/v1', bookApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
