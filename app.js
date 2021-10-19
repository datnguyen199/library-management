var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

require('dotenv').config();
var passportConfig = require('./config/passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bookApiRouter = require('./routes/api/book');
var userApiRouter = require('./routes/api/user');
var bookInstanceApiRouter = require('./routes/api/bookInstance');

var app = express();

var mongoDBUrl = process.env.MONGODB_URL;

// mongodb+srv://libraryAdmin1:Aa%4012345678@mee6copycluster-shard-00-00.r86qy.mongodb.net/admin?retryWrites=true&w=majority
// mongodb://libraryAdmin1:Aa%4012345678@mee6copycluster-shard-00-00.r86qy.mongodb.net:27017,mee6copycluster-shard-00-01.r86qy.mongodb.net:27017,mee6copycluster-shard-00-02.r86qy.mongodb.net:27017/library_management?ssl=true&replicaSet=atlas-5r6qbu-shard-0&authSource=admin&retryWrites=true&w=majority
// mongodb://admin:1234@cluster0.l8qu8.mongodb.net:27017/

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

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let Genre = require('./models/genre');
Genre.deleteMany({}, function() {});
Genre.create({ name: 'Fiction', description: 'this is description of fiction' }, function(err, genre) {
  if(err) console.log(err)
  else console.log('create genre success');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passportConfig.passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1', bookApiRouter);
app.use('/api/v1', userApiRouter);
app.use('/api/v1', bookInstanceApiRouter);

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
