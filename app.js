var mongoose = require('mongoose'),
    UserSchema = require('./models/user.js');
    mongoose.model('User', UserSchema);

mongoose.connect(process.env['MONGOHQ_URL'] || 'mongodb://localhost/allmyphotos');

var User = mongoose.model('User');
var MongoStore = require('express-session-mongo');
var callbackBaseUrl = "http://" + (process.env.host || "localhost:3000");

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , InstagramStrategy = require('passport-instagram').Strategy
  , DropboxStrategy = require('passport-dropbox').Strategy;

var conf = require('./conf.js');


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({_id : id.toString()}, function (err, user) {
    done(err, user);
  });
});


function updateProfile(user, profile, done){

  user.accounts = (user.accounts || {});
  user.emails = (user.emails || []);

  user.displayName = profile.displayName;
  user.accounts[profile.provider] = profile;

  if (profile.emails)
  {
    profile.emails.forEach(function(e){
      if (user.emails.indexOf(e) < 0)
      {
        console.log('added email', e);
        user.emails.push(e); // add new emails to the main object
      }
    });
  }

  user.save(function(err, user){
    return done(err, user);
  });
}

function findOrCreateAndUpdateUser(user, profile, done)
{

  if (user)
    return updateProfile(user, profile, done);

  // we will use many providers but still want's to connect them to the same account,
  // therefore we will search for this user according to it's id for this particular provider,
  // if no one is found we will create it. If found we will update the accounts.

  User.findOne({ '$where' : 'this.accounts.' + profile.provider + '.id == ' + profile.id }, function (err, user) {


      if (!user) user = new User();

      return updateProfile(user, profile, done);

  });
}

// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
    clientID: conf.instagram.clientId,
    clientSecret: conf.instagram.clientSecret,
    callbackURL: callbackBaseUrl + "/auth/instagram/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    
    return findOrCreateAndUpdateUser(req.user, profile, done);
  }
));

// Use the DropboxStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Dropbox profile), and
//   invoke a callback with a user object.
passport.use(new DropboxStrategy({
    consumerKey: conf.dropbox.consumerKey,
    consumerSecret: conf.dropbox.consumerSecret,
    callbackURL: callbackBaseUrl + "/auth/dropbox/callback",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {

    profile.token = token;
    profile.tokenSecret = tokenSecret;

    return findOrCreateAndUpdateUser(req.user, profile, done);
  }
));


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


exports.init = function(port) {


    console.log('env', process.env);

    var mongooseConfig = mongoose.connections[0].db.serverConfig;

    var dbConfig = {
        db: mongooseConfig.db,
        host: mongooseConfig.host,
        collection: mongooseConfig.collection // optional, default: sessions
      };

    var app = express.createServer();

    // configure Express
    app.configure(function() {
      app.set('views', __dirname + '/views');
      app.set('view engine', 'ejs');
      app.use(express.logger());
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.session({ secret: 'keyboard cat' }));
      // Initialize Passport!  Also use passport.session() middleware, to support
      // persistent login sessions (recommended).
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(express.static(__dirname + '/static'));
      app.use(app.router);
    });


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


    app.error(function(err, req, res, next){
        res.render('500.ejs', { locals: { error: err },status: 500 });
    });

    app.listen(port);

    console.log("Listening on port %d in %s mode", app.address().port, app.settings.env);

    return app;
}