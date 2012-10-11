var mongoose = require('mongoose');

var conn = mongoose.connect(process.env['MONGOHQ_URL'] || 'mongodb://localhost/allmyphotos');

var User = require('./models/user');
var callbackBaseUrl = "http://" + (process.env.HOST || "localhost:3000");

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , InstagramStrategy = require('passport-instagram').Strategy
  , FlickrStrategy = require('passport-flickr').Strategy
  , DropboxStrategy = require('passport-dropbox').Strategy;

var MongoStore = require('connect-mongo')(express);
var conf = require('./conf.js');


passport.serializeUser(function(user, done) {
  done(null, user.toJSON());
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


function updateProfile(user, profile, done){

  if (!user)
    throw new Error("User must have a value");

  var accounts = (user.accounts || {});
  var emails = (user.emails || []);

  accounts[profile.provider] = profile;

  user.updated = new Date();

  if (profile.emails)
  {
    profile.emails.forEach(function(e){
      if (emails.indexOf(e) < 0)
      {
        emails.push(e); // add new emails to the main object
      }
    });
  }

  user.displayName = profile.displayName;
  user.set('emails', emails);
  user.set('accounts', accounts);

  return user.save(function(err, savedUser){
    done(err, savedUser);
  });
}

function findOrCreateAndUpdateUser(user, profile, done)
{

  // even if we have the serialized user object, we still want to use the db user so we can save and update it correctly
  if (user && user._id){
    return User.findOne(user._id, function(err, foundUser){

      if (!foundUser)
        foundUser = new User(user);

      return updateProfile(foundUser, profile, done);
  
    });
  }

  // we will use many providers but still want's to connect them to the same account,
  // therefore we will search for this user according to it's id for this particular provider,
  // if no one is found we will create it. If found we will update the accounts.

  return User.findOne({ '$where' : 'this.accounts && this.accounts["' + profile.provider + '"] && this.accounts["' + profile.provider + '"].id == ' + profile.id }, function (err, foundUser) {

      if (err){
        return done(err, null);
      }

      if (!foundUser) {
        user = new User();
      } else {
        user = foundUser;
      }


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

passport.use(new FlickrStrategy({
    consumerKey: conf.flickr.consumerKey,
    consumerSecret: conf.flickr.consumerSecret,
    callbackURL: callbackBaseUrl + "/auth/flickr/callback",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {

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


exports.findOrCreateAndUpdateUser = findOrCreateAndUpdateUser;

exports.init = function(port) {


    var app = express.createServer();

    // configure Express
    app.configure(function() {
      app.set('views', __dirname + '/views');
      app.set('view engine', 'ejs');
      app.use(express.logger());
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.session({ secret: 'keyboard cat', store: new MongoStore({url: process.env['MONGOHQ_URL'] || 'mongodb://localhost/allmyphotos'}) }));
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