var User = require('../../models/User');
var fs = require('fs');
var passport = require('passport');
var async = require('async');
var ViewModel = require('./viewModel');

module.exports = function(app){

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      res.redirect('/login');
    }


    app.all("/me/*", ensureAuthenticated, function(req, res, next) {
      if (!req.user)
        return res.redirect("/login");

      next(); // if the middleware allowed us to get here,
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.redirect('/');
    });

    app.get('/login', function(req, res) {
        res.render('login', new ViewModel(req.user));
    });

    app.post('/register', function(req, res) {
        User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
                console.log(err);
                return res.render('login', new ViewModel(account));
            }

            res.redirect('/');
        });
    });

};
