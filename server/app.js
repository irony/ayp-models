// Main app configuration
// ======================
// Initializes database, all routes and express
 

var config      = require('../conf');
var mongoose    = require('mongoose');
var _           = require('underscore');
var colors      = require('colors');
var http        = require('http');
var express     = require('express');
var util        = require('util');
var passport    = require('./auth/passport');
var knox        = require('knox');
var RedisStore  = require('connect-redis')(express);
var SocketIo    = require('socket.io');
var passportsio = require("passport.socketio");
var fs          = require('fs');
var io          = require('socket.io');
//var spdy        = require('spdy');
var app         = express.createServer();
var store       = new RedisStore();

console.debug = console.log;

try {
  mongoose.connect(config.mongoUrl);
  console.debug("Started connection on " + config.mongoUrl.split('@')[1].cyan + ", waiting for it to open...".grey);
} catch (err) {
  console.log(("Setting up failed to connect to " + config.mongoUrl).red, err.message);
}


var options = {
    ca:   fs.readFileSync(__dirname + '/../ssl/sub.class1.server.ca.pem'),
    key:  fs.readFileSync(__dirname + '/../ssl/ssl.key'),
    cert: fs.readFileSync(__dirname + '/../ssl/ssl.crt')
  };

// store the s3 client and socket io globally so we can use them from both jobs and routes without passing it as parameters
global.s3 = knox.createClient(config.aws);
//app.spdy = spdy.createServer(options, app.handle.bind(app));
app.io = io.listen(app, {log: false});


exports.init = function() {
  

    // configure Express
    app.configure(function() {

      var sessionOptions = { secret: config.sessionSecret, store: store };

      app.set('views', __dirname + '/views');
      app.set('view engine', 'ejs');
      // app.use(express.logger());
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.session(sessionOptions));
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(express.static(__dirname + '/../client'));
      app.use(app.router);


      app.io.set("authorization", passportsio.authorize(sessionOptions));
    });

    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        global.debug = true;
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

    require('./routes/user')(app);
    require('./routes/connectors')(app);
    require('./routes/share')(app);
    require('./routes/photos')(app);
    require('./routes/import')(app);
    require('./routes/index')(app);
    require('./sockets/photos')(app);

    // Api methods
    require('./api/photos')(app);
    require('./api/user')(app);


    /* The 404 Route (ALWAYS Keep this as the last route) */
    require('./routes/404')(app);


    return app;
}