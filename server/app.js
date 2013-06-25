// Main app configuration
// ======================
// Initializes database, all routes and express
 

var config      = require('../conf'),
    mongoose    = require('mongoose'),
    _           = require('lodash'),
    knox        = require('knox'),
    colors      = require('colors');


var express = require('express'),
  passport = require('../server/auth/passport'),
  LocalStrategy = require('passport-local').Strategy,
  http = require('http'),
  path = require('path'),
  util = require('util'),
  fs = require('fs'),
  redis = require('redis'),
  cookie = require('cookie'),
  connectSession = require('connect/lib/middleware/session/session'),
  socketRedisStore = require('socket.io/lib/stores/redis');
 
var app = express(),
  server = http.createServer(app),
  io = require('socket.io').listen(server),
  redisPub = redis.createClient(),
  redisSub = redis.createClient(),
  redisClient = redis.createClient(),
  RedisStore = require('connect-redis')(express),
  partials = require('express-partials'),
  sessionStore;


console.debug = console.log;

try {
  mongoose.connect(config.mongoUrl);
  console.debug("Started connection on " + (config.mongoUrl.split('@').slice(-1)).cyan + ", waiting for it to open...".grey);
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

exports.init = function() {
  
    var sessionOptions = { key: 'express.sid', cookieParser: express.cookieParser, secret: config.sessionSecret, store: sessionStore, cookie: {maxAge : 365 * 24 * 60 * 60 * 1000 }};

    // configure Express
    app.configure(function() {

      sessionStore = new RedisStore({
        client: redisClient,
      });

      app.set('views', __dirname + '/views');
      app.set('view engine', 'ejs');
      app.use(partials());

      app.use(express.cookieParser(config.sessionSecret));
      app.use(express.methodOverride());
      app.use(express.bodyParser());
      app.use(express.session(sessionOptions));
      app.use(passport.initialize());
      app.use(passport.session());

      app.use('/vendor/', express.static(path.join(__dirname, '/../components')));
      app.use(express.static(__dirname + '/../client'));
      app.use(app.router);


    });

    /**
     * socket.io stuff. Streaming.
     */
    // authentication verification
    io.configure(function () {
       io.set('log level', 1);
       io.set('authorization', function (data, accept) {
         if (data.headers.cookie) {
           data.cookie = cookie.parse(data.headers.cookie);
           data.cookie = express.connect.utils.parseSignedCookies(data.cookie, config.sessionSecret);
           data.cookie = express.connect.utils.parseJSONCookies(data.cookie);
           data.sessionID = data.cookie['express.sid'];
           sessionStore.load(data.sessionID, function (err, session) {
             if (err || !session) {
               // invalid session identifier. tl;dr gtfo.
               accept('session error', false);
             } else {
               data.session = session;
               accept(null, true);
             }
           });
     
         } else {
          // no auth cookie...
           accept('session error', false);
         }
       });
    });

    // shorthand to get it accessible everywhere
    app.io = io;
 
    
    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        global.debug = true;
        // app.use(express.logger({ format: ':method :url' }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
        console.debug = function(){};
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

    app.use(function(err, req, res, next){
      // if an error occurs Connect will pass it down
      // through these "error-handling" middleware
      // allowing you to respond however you like
      if (err) res.render('500.ejs', { locals: { error: err },status: 500 });
    });
    /* The 404 Route (ALWAYS Keep this as the last route) */
    require('./routes/404')(app);


    return app;
}