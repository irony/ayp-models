var dbox  = require("dbox");
var config = { "app_key": "430zvvgwfjxnj4v", "app_secret": "un2e5d75rkfdeml", root : 'dropbox'};
var dbox  = require("dbox");
var async  = require("async");
var dropbox   = dbox.app(config);
var passport = require('passport');
var Photo = require('../models/photo');
var PathReducer = require('../utils/PathReducer');
var _ = require('underscore');


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



	app.get('/img/thumbnails/dropbox/*:id', function(req,res){
		var id = req.url.split("/dropbox/")[1], // because of a bug in req.params parser i can't use that parameter, i will use url instead
				client = this.getClient(req.user);
		
		console.log('Downloading thumbnail', id);

		Photo.findOne({'_id': id, 'owners':req.user._id}, function(err, photo){

			if ( err || !photo ) return res.send(403, err);

			self.downloadThumbnail(photo, client, req.user, function(err, thumbnail){
				if (err) {
					return res.send(500, err);
				}

				return res.end(thumbnail);
			});

		});
	});

	app.get('/img/originals/dropbox/*:id', function(req,res){
		var id = req.url.split("/dropbox/")[1], // because of a bug in req.params parser i can't use that parameter, i will use url instead
				client = this.getClient(req.user);
		
		console.log('Downloading original', id);

		Photo.findOne({'_id': id, 'owners':req.user._id}, function(err, photo){

			if ( err || !photo ) return res.send(403, err);

			self.downloadPhoto(photo, client, req.user, function(err, thumbnail){
				if (err) {
					return res.send(500, err);
				}

				return res.end(thumbnail);
			});

		});
	});



	this.downloadThumbnail = function(photo, client, user, done){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done('Not a dropbox user', null);


		if (!photo) {
			return null;
		}


		var filename = __dirname + '/../static/img/thumbnails/' + photo.source + '/' + photo._id;
		var fs = require('fs');
		var p = require('path');

		//if (p.existsSync(filename)) //TODO: add force download switch
	//		return;

		client.thumbnails(photo.path, {size: 'l'},function(status, thumbnail, metadata){

			if (status !== 200){

				if(status === 415) {
					console.log('415 received, removing photo. This is not a photo.')
					return photo.remove();
				}

				if(status === 404) {
					console.log('404 received, it was not found in your dropbox anymore.')
				}


				if (done && status) {
					return done(new Error('Could not download thumbnail from dropbox, error nr ' + status));
				}

				
				console.log('error downloading thumbnail', status, thumbnail);
				return;
			}
			var mkdirp = require('mkdirp');

			var pathArray = filename.split('/');
			pathArray.pop(); // remove file part

			mkdirp(pathArray.join('/'), function (err) {
				if (err && done) {
					return done(err);
				}

				fs.writeFile(filename, thumbnail, function(err){
					return done(err, thumbnail);
				});

			});
		});
	};


	this.downloadPhoto = function(photo, client, user, done){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done('Not a dropbox user', null);


		if (!photo) {
			return null;
		}


		var filename = __dirname + '/../static/img/originals/' + photo.source + '/' + photo._id,
				fs = require('fs'),
				p = require('path');

		console.log('downloading path...', photo.path, photo.metadata.bytes);
	  client.get(photo.path, function(status, reply){

			if (status !== 200){

				if(status === 415) {
					return console.log('415 received, removing photo. This is not a photo.', reply);
				}

				if(status === 404) {
					return console.log('404 received, removing photo. It is not found in dropbox.', reply);
				}

				if (done && status) {
					return done(new Error('Could not download thumbnail from dropbox, error nr ' + status));
				}
				
				console.log('error downloading image', status, reply);
				return;
			}
			var mkdirp = require('mkdirp'),
					pathArray = filename.split('/');

			pathArray.pop(); // remove file part

			mkdirp(pathArray.join('/'), function (err) {
				if (err && done) {
					return done(err);
				}

				fs.writeFile(filename, reply, function(err){
					console.log('done downloading photo');
					return done(err, reply);
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
		if (!user || !user.accounts.dropbox){
			return done('Not dropbox folder', null);
		}

		var client = this.getClient(user);
		
		console.log('getting all photo dirs');

		client.readdir('/', {recursive: true, details: true}, function(status, reply){
				console.log('found %d files. Extracting media files...', reply.length, reply);
		    var photos = reply.map(function(photo){
					return photo.mime_type && photo.bytes > 4096 && ['image', 'video'].indexOf(photo.mime_type.split('/')[0]) >= 0 ? photo : null;
		    }).reduce(function(a,b){
					if (b) {a.push(b)} // remove empty rows
					return a;
		    }, []);

				_.forEach(photos, function(photo){
					photo.source = 'dropbox';
					// self.downloadThumbnail(photo, client, user, done);
				});
				return done(null, photos);
		});


	};

	return this;

};
