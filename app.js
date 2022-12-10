var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var firebase = require('firebase')
const dotenv = require('dotenv');
dotenv.config();
 

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth')
var userRouter = require('./routes/user')
var adminRouter = require('./routes/admin')
var vendorRouter = require('./routes/vendor')

var reportRouter = require('./routes/report')

var reportRouter1 = require('./routes/reports')
var pointsRouter = require('./routes/points')
var sliderRouter = require('./routes/slider')
var primaryRouter = require('./routes/primarycategory')
var productRouter = require('./routes/product')
var refervendorRouter = require('./routes/refervendor')
var membershipsRouter = require('./routes/membership')
var categoriesRouter = require('./routes/categories')
var packageRouter = require('./routes/package')
var areaRouter = require('./routes/area')
var levelRouter = require('./routes/level')
var generalsettingRouter = require('./routes/generalsetting')
var faqRouter = require('./routes/faq')

/** New APi **/ 

var Apiuser = require('./routes/apiuser')
//var transactionRouter = require('./routes/transaction')

let AssociateModel = require('./model/associate')

var app = express();




var mongoose   = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.connect(process.env.MONGO_ADDRESS, {useNewUrlParser: true, useUnifiedTopology: true}); // connect to our database
mongoose.connect("mongodb+srv://srilachu95:lachu98@cluster0.tagoptc.mongodb.net/Paizatto_new", {useNewUrlParser: true, useUnifiedTopology: true}); // connect to our database

var cron = require('node-cron')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admins', adminRouter);
app.use('/api/vendors', vendorRouter);
//app.use('/api/reports', reportRouter);
app.use('/api/reports', reportRouter1);
app.use('/api/admin', pointsRouter);
app.use('/api/users', sliderRouter);
app.use('/api/users', primaryRouter);
app.use('/api/admin', productRouter);
app.use('/api/admin', refervendorRouter);
app.use('/api/users', membershipsRouter);
app.use('/api/admin', areaRouter);
app.use('/api/admin', categoriesRouter);
app.use('/api/admin', packageRouter);
app.use('/api/admin', levelRouter);
app.use('/api/admin', generalsettingRouter);
app.use('/api/admin', faqRouter);


/** New APi **/
app.use('/api/users', Apiuser);
//app.use('/api/transaction', transactionRouter)


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
  console.log(err)
  res.status(err.status || 500);
  res.render('error');
});

//cron.schedule('0 0 1 * *', () => {
cron.schedule('0 0 1 * *', async() => {
  console.log(new Date())
  console.log('running a task every minute');
  let UpdateAssociates = await AssociateModel.updateMany({},{$set:{isActive:false}})
  console.log(UpdateAssociates)
});

module.exports = app;
