var passport = require('passport');

module.exports = function (app) {

app.get('/auth/flickr',
  passport.authenticate('flickr'),
  function(req, res){
    // The request will be redirected to Flickr for authentication, so this
    // function will not be called.
  });

app.get('/auth/flickr/callback', 
  passport.authenticate('flickr', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
	return this;

};
