var conf = require('../../conf'),
    callbackBaseUrl = conf.baseUrl,
    passport = require('passport'),
    InstagramStrategy = require('passport-instagram').Strategy,
    FlickrStrategy = require('passport-flickr').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    DropboxStrategy = require('passport-dropbox').Strategy,
    LocalStrategy = require('passport-local').Strategy,
    User = require('../../models/user.js'),
    auth = require('./auth.js');


  passport.serializeUser(function(user, done) {

    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
      // console.log(user)
    /*done(null, {
      salt: '9a6c4fb43774bd717e8303a1a825a2c1abaa9c13a09803991f9d6113656168e8',
      hash: '49e5f894c6910c7c3c8f02a2a697be481700487ec1677a03e6a5636b0c59f1af7dbbe62425bd182934ea341d4bcad0a1fcd976f5bb974754a6f2ec5be2f198bef4c51cbea66f4385e7f5ebb99dd85d8ac0845cdf17c9045da68119c5c423efae0452b1f980bbd19626b50e32be26766ae22691dad5caf3a74631c0b013d0ed7718ddfd117b31ea71449aaa69b0c56d0f0d8075cb4c4646e74640d3112b8616ee52b56884ad5889c528c4e69ce6fa86e2db9856c4e2637ffc909c19b2fbcb0c436a847f38dfabd845ff6f2c3431e0cf61d318dcce8d08b8a40c674c86edbdcd15f4eeb01589deeb2c1ff0403e5904345e1085a5e5d2e3f908f207450c49c80ad4b9df322b9165c6d47c652ba403a516d12bf0ba877bd2edf5f28cf3026fcbdacdf620391655f8c76539a6f7f417d0712bda5c4f21122aa41f198bc3120e489c5a95f5bd14b1d9ce296948f9efcb1258e6c56353e98789af9a4988646754cbc4e81e73dc1d0713675bc7d0f2799cd814bd0a11f6ce7e7b40c19030a877b57e2885b4dad44205fafc7821f46233133cc0d78b7d4e5efb20753d54e25dcc4384f82d1c09709c9d2b010d81fd3de762eb4a591cef140280b2d4ed5ad3cff467c8c7de07c0eff9e0986810efb0da9997b626f899ccd00b686f79032da569ccdcdf36a2ab21c0c2dbb7fdcecf887760c6d4fcf44b374c895157e19f71fbce3a80b02bf5',
      _id: '51793dae071f0b0ee8000005',
      username: 'test237158.7292291224',
      __v: 0,
      subscription: 0,
      emails: []
    });
    */
   
    User.findById(id, function(err, user){
      console.log('deserializeUser done', err, user, done);
      done(err, user);
    });

    // User.findById(id, done);
/*    setTimeout(function() {
      done.call(this, null, id);
    }, 1);*/
  });
  passport.use(new LocalStrategy(User.authenticate()));
/*

  // Use the InstagramStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Instagram
  //   profile), and invoke a callback with a user object.
  passport.use(new TwitterStrategy({
      consumerKey: conf.twitter.consumerKey,
      consumerSecret: conf.twitter.consumerSecret,
      clientSecret: conf.instagram.clientSecret,
      callbackURL: callbackBaseUrl + "/auth/twitter/callback",
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
      consumerKey: conf.dbox.app_key,
      consumerSecret: conf.dbox.app_secret,
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
*/

module.exports = passport;