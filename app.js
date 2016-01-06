var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var compression = require('compression');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var writer = require('./routes/writer')
var reviewer = require('./routes/reviewer');
var coordinator = require('./routes/coordinator');
var admin = require('./routes/admin');

var app = express();
app.use(compression());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'iVm5WIXT38zufI6QXWW4ZiBRevs9aXr9',
  store: new MongoStore({
    url:'mongodb://localhost/conference'
  }),
  ttl: 14 * 24 * 60 * 60,
  // resave:true,
  // saveUninitialized:true,
  // cookie:{ secure:true }
}));
app.use('/', routes);
app.use('/', writer);
app.use('/', reviewer);
app.use('/', coordinator);
app.use('/', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
