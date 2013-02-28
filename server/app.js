// Main app configuration
// ======================
// Initializes database, all routes and express

var config = require('../conf');
var mongoose = require('mongoose');

// Connect database directly
var conn = mongoose.connect(config.mongoUrl);

// load dependencies
var _ = require('underscore');
var http = require('http');
var express = require('express');
var util = require('util');

var MongoStore = require('connect-mongo')(express);
var passport = require('./auth/passport');
var knox      = require('knox');


// more logs
// require('longjohn');

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


exports.init = function() {


    var app = express.createServer();

    // configure Express
    app.configure(function() {
      app.set('views', __dirname + '/views');
      app.set('view engine', 'ejs');
      // app.use(express.logger());
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      
      // We use mongo to store sessions
      app.use(express.session({ secret: 'keyboard cat', cookie: { maxAge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)}, store: new MongoStore({url: config.mongoUrl })}));
      // Initialize Passport!  Also use passport.session() middleware, to support
      // persistent login sessions (recommended).
      //
      // TODO: Add authentication for socket.io here
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(express.static(__dirname + '/../client'));
      app.use(app.router);
    });


    // store the s3 client globally so we can use it from both jobs and routes without passing it as parameters
    global.s3 = knox.createClient(config.aws);

    // default is 5 and we need download in parallell from s3
    // http.globalAgent.maxSockets = 50;

    app.get('/account', ensureAuthenticated, function(req, res){
      res.render('account', { user: req.user });
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });


    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        // app.use(express.logger({ format: ':method :url' }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });

    // Error handler
    app.error(function(err, req, res, next){
        res.render('500.ejs', { locals: { error: err },status: 500 });
    });


    return app;
}