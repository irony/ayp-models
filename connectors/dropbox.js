var dbox  = require("dbox");
var config = { "app_key": "430zvvgwfjxnj4v", "app_secret": "un2e5d75rkfdeml", root : 'dropbox'};
var dbox  = require("dbox");
var dropbox   = dbox.app(config);
var passport = require('passport');

module.exports = function (app) {

	var self = this;

		// GET /auth/dropbox
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Dropbox authentication will involve redirecting
	//   the user to dropbox.com.  After authorization, Dropbox will redirect the user
	//   back to this application at /auth/dropbox/callback
	app.get('/auth/dropbox',
		passport.authenticate('dropbox'),
		function(req, res){
		// The request will be redirected to Dropbox for authentication, so this
		// function will not be called.s
	});

	// GET /auth/dropbox/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/auth/dropbox/callback',
		passport.authenticate('dropbox', { failureRedirect: '/login' }),
		function(req, res) {
			res.redirect('/import');
		});



	app.get('/img/thumbnails/:uid/dropbox/*:path', function(req,res){
		var path = req.url.split(req.params.uid + '/dropbox')[1]; // because of a bug in req.params parser i can't use that parameter, i will use url instead
		var client = this.getClient(req.user);
		
		console.log('Downloading thumbnail', path);
		this.downloadThumbnail(path, client, req.user, function(err, thumbnail){

			res.end(thumbnail);
		});
	});

	/*
	// TODO: move these to separate routes/controllers
	app.get('/auth/dropbox', function(req,res){


		dropbox.requesttoken(function(status, request_token){
			console.log('token', request_token);
			console.log('request', req);

			app.tokens[request_token.oauth_token] = request_token;

			res.redirect(request_token.authorize_url + "&oauth_callback=http://" + req.headers.host + "/auth/dropbox/callback");

		});

	});




	// TODO: move to separate dropbox controller / route
	app.get('/auth/dropbox/callback', function(req, res){
		// app.session.dropboxUid = req.body.uid;
		var token = (req.query || req.body).oauth_token;
		var request_token = app.tokens[token];
		
		console.log(request_token);
		dropbox.accesstoken(request_token, function(status, access_token){
			console.log('access', status, access_token);
			if (status == 200)
			{
				self.saveToken(access_token);
				res.redirect('/photos?uid=' + access_token.uid);
			}
			else{
				locals.error = status + ", error when connecting with DropBox";
				res.render("500.ejs", locals);
			}
		});
	});*/

	this.downloadThumbnail = function(path, client, user, done){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done('Not a dropbox user', null);




		var filename = __dirname + '/../static/img/thumbnails/' + user._id + '/dropbox' + path;
		var fs = require('fs');
		var p = require('path');

console.log(filename);

		if (p.existsSync(filename))
			return;

		console.log('downloading thumbnail', path);

		client.thumbnails(path, {size: 'l'},function(status, thumbnail, metadata){

			if (status != 200){
				console.log('error', status, thumbnail);
				return;
			}
			var mkdirp = require('mkdirp');

			var pathArray = filename.split('/');
			pathArray.pop(); // remove file part

			mkdirp(pathArray.join('/'), function (err) {
				if (err && callback)
					return done(err);

				fs.writeFile(filename, thumbnail, function(err){
					return done(err, thumbnail);
				});

			});
		});
	};

	this.getClient = function(user){

		// TODO: load from database and move these to import class instead
		var access_token = {
			"oauth_token_secret"	:  user.accounts.dropbox.tokenSecret,
			"oauth_token"			:  user.accounts.dropbox.token
		};

		var client = dropbox.client(access_token);
		return client;
	};

	this.downloadAllPhotos = function(user, done)
	{
		if (!user || !user.accounts.dropbox)
			return done('Not dropbox folder', null);


		var client = this.getClient(user);

		client.search("/", "jpg", function(status, reply){
			
			if (status != 200)
				return done(status, null);

			var photos = Array.prototype.slice.call(reply);

			photos.forEach(function(photo){
				// self.downloadThumbnail(photo.path, client, user, done);
				photo.source = 'dropbox';
			});

			return done(null, photos);
		});

	};

	return this;

};
