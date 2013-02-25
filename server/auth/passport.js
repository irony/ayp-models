var callbackBaseUrl = "http://" + (process.env.HOST || "dev.allyourphotos.org:5000"),
    passport = require('passport'),
    InstagramStrategy = require('passport-instagram').Strategy,
    FlickrStrategy = require('passport-flickr').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    DropboxStrategy = require('passport-dropbox').Strategy,
    User = require('../models/user.js'),
    auth = require('./auth.js'),
    conf = require('../conf.js');


  passport.serializeUser(function(user, done) {
    done(null, user.toJSON());
  });

  passport.deserializeUser(function(user, done) {
      done(null, user);
//      User.findById(user._id, done);
  });

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
      
      return auth.findOrCreateAndUpdateUser(req.user, profile, done);
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

      return auth.findOrCreateAndUpdateUser(req.user, profile, done);
    }
  ));

  passport.use(new FlickrStrategy({
      consumerKey: conf.flickr.consumerKey,
      consumerSecret: conf.flickr.consumerSecret,
      callbackURL: callbackBaseUrl + "/auth/flickr/callback",
      passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {

      return auth.findOrCreateAndUpdateUser(req.user, profile, done);

    }
  ));

  passport.use(new FacebookStrategy({
    clientID: conf.facebook.appId,
    clientSecret: conf.facebook.appSecret,
    callbackURL: callbackBaseUrl + "/auth/facebook/callback"
  },
  function(req, accessToken, refreshToken, profile, done) {

      profile.token = accessToken;
      profile.refreshToken = refreshToken;

      return auth.findOrCreateAndUpdateUser(req.user, profile, done);

  }
));

module.exports = passport;