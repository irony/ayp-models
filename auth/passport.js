var FlickrStrategy = require('passport-flickr').Strategy,
    InstagramStrategy = require('passport-instagram').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    DropboxStrategy = require('passport-dropbox').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    nconf = require('nconf'),
    User = require('../models/user'),
    auth = require('./auth.js');

var passport = require('passport');
var callbackBaseUrl = nconf.get('baseUrl') + '/api/user';

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    return done(err, user);
  });
});
passport.use(new LocalStrategy({usernameField:'username'}, User.authenticate()));
// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new TwitterStrategy({
    consumerKey: nconf.get('twitter:consumerKey'),
    consumerSecret: nconf.get('twitter:consumerSecret'),
    clientSecret: nconf.get('instagram:clientSecret'),
    callbackURL: callbackBaseUrl + "/twitter/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    
    return auth.findOrCreateAndUpdateUser(req.user, profile, done);
  }
));

// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
    clientID: nconf.get('instagram:clientId'),
    clientSecret: nconf.get('instagram:clientSecret'),
    callbackURL: callbackBaseUrl + "/instagram/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    
    return auth.findOrCreateAndUpdateUser(req.user, profile, done);
  }
));

// Use the DropboxStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Dropbox profile), and
//   invoke a callback with a user object.
passport.use(new DropboxStrategy({
    consumerKey: nconf.get('dbox:app_key'),
    consumerSecret: nconf.get('dbox:app_secret'),
    callbackURL: callbackBaseUrl + "/dropbox/callback",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {

    console.log(profile);
    
    profile.token = token;
    profile.tokenSecret = tokenSecret;

    return auth.findOrCreateAndUpdateUser(req.user, profile, done);
  }
));

passport.use(new FlickrStrategy({
    consumerKey: nconf.get('flickr:consumerKey'),
    consumerSecret: nconf.get('flickr:consumerSecret'),
    callbackURL: callbackBaseUrl + "/flickr/callback",
    passReqToCallback: true
  },
  function(req, token, tokenSecret, profile, done) {

    return auth.findOrCreateAndUpdateUser(req.user, profile, done);

  }
));

passport.use(new FacebookStrategy({
  clientID: nconf.get('facebook:appId'),
  clientSecret: nconf.get('facebook:appSecret'),
  callbackURL: callbackBaseUrl + "/facebook/callback"
},
function(req, accessToken, refreshToken, profile, done) {
      console.log('authorize facebook');
      
      profile.token = accessToken;
      profile.refreshToken = refreshToken;

      return auth.findOrCreateAndUpdateUser(req.user, profile, done);

  }
));

module.exports = passport;

