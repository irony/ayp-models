// Main app configuration
// ======================
// Initializes database, all routes and express
 

var config = require('../conf');
        


var mongoose = require('mongoose');
var _ = require('underscore');
var colors = require('colors');
var http = require('http');
var express = require('express');
var util = require('util');
var passport = require('./auth/passport');
var knox      = require('knox');
// var MongoStore = require('connect-mongo')(express);
var RedisStore = require('connect-redis')(express);
var db;

mongoose.connection.on("open", function(ref) {
  return console.log("Connected to mongo server!".green);
});

mongoose.connection.on("error", function(err) {
  console.log("Could not connect to mongo server!".yellow);
  return console.log(err.message.red);
});

try {
  mongoose.connect(config.mongoUrl);
  db = mongoose.connection;
  console.log("Started connection on " + config.mongoUrl.cyan + ", waiting for it to open...".grey);
} catch (err) {
  console.log(("Setting up failed to connect to " + config.mongoUrl).red, err.message);
}

// store the s3 client globally so we can use it from both jobs and routes without passing it as parameters
// TODO: move to connectors
global.s3 = knox.createClient(config.aws);


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

      //app.use(express.session({ secret: 'a2988-438674-f234a', store: new RedisStore()}));
      app.use(express.session({ secret: 'a2988-438674-f234a'}));

      
      // Initialize Passport!  Also use passport.session() middleware, to support
      // persistent login sessions (recommended).
      //
      // TODO: Add authentication for socket.io here
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(express.static(__dirname + '/../client'));
      app.use(app.router);
    });


    app.all("/me/*", ensureAuthenticated, function(req, res, next) {
      if (!req.user)
        return res.redirect("/login");

      next(); // if the middleware allowed us to get here,
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });


    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        global.debug = true;
        console.debug = console.log;
        // app.use(express.logger({ format: ':method :url' }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
        console.debug = function(){};
    });

    // Error handler
    app.error(function(err, req, res, next){
        res.render('500.ejs', { locals: { error: err },status: 500 });
    });


    return app;
}