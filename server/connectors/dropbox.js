var dbox  = require("dbox");
var config = require('../../conf');
var dbox  = require("dbox");
var async  = require("async");
var dropbox   = dbox.app(config.dbox);
var passport = require('passport');
var InputConnector = require('./inputConnector');
var Photo = require('../../models/photo');
var User = require('../../models/user');
var _ = require('underscore');
var ObjectId = require('mongoose').Types.ObjectId;
var stream = require("stream");

var connector = new InputConnector();

	connector.scope = '';

	

	connector.downloadThumbnail = function(user, photo, done){
	
	  if (!done) throw new Error("Callback is mandatory");
	  if (!photo.path) throw new Error("Path is not set on photo.");

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done(null, null); // 'Not a dropbox user'


		if (!photo) {
			return done(null, null);
		}


		var filename = photo.source + '/' + photo._id;

		try {
			var client = this.getClient(user);

			var req = client.thumbnails(photo.path, {size: 'l'});

			req.onResponse = function(res){
				if(!res || res.statusCode >= 400){
					console.log('error thumbnail'.red, res);
					return done("Error downloading thumbnail");

				}

				connector.upload('thumbnail', photo, res, done);
			};
		} catch(err){
			done(err);
		}

	};


	connector.downloadOriginal = function(user, photo, done){
		if (!done) throw new Error("Callback is mandatory");

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done(new Error('Not a dropbox user'), null); // not a dropbox user


		if (!photo) {
			return done(null, null);
		}

		var client = this.getClient(user);

		var req = client.stream(photo.path);

		req.onResponse = function(res){
			//res.length = photo.bytes;
			
			if(!res || res.statusCode >= 400){
				console.log('error original'.red, res);
				return done("Error downloading original");
			}

			connector.upload('original', photo, res, done);
		};


	};


	connector.getClient = function(user){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return;
		
		var access_token = {
			"oauth_token_secret"	:  user.accounts.dropbox.tokenSecret,
			"oauth_token"					:  user.accounts.dropbox.token,
		};

		var client = dropbox.client(access_token);
		return client;
	};

	connector.importNewPhotos = function(user, done)
	{

	  if (!done) throw new Error("Callback is mandatory");

		if (!user || !user._id || user.accounts.dropbox === undefined){

			return done(new Error('Not a valid dropbox user'));

		}
		var client = this.getClient(user);



			// console.log('downloading metadata from dropbox for user id', user._id);

    return User.findById(user._id, function(err, user){

			if (err || !user || !user.accounts || !user.accounts.dropbox) return done('error finding user or this user don\'t have dropbox');


			var client = connector.getClient(user);
			

			if (!user.accounts.dropbox.cursor) console.log('Importing all photos for user', user._id);


			var loadDelta = function(cursor){
				client.delta({cursor : cursor}, function(status, reply){
					
					if (status !== 200 || !reply)
						return done && done(status);

			    var photos = (reply.entries || []).map(function(photoRow){

						var photo = photoRow[1];
						if (!photo)
							return null;

						photo.mimeType = photo && photo.mime_type;
						photo.taken = photo && photo.client_mtime;

						return photo && photo.mime_type && photo.bytes > 4096 && ['image', 'video'].indexOf(photo.mime_type.split('/')[0]) >= 0 ? photo : null;
			    
			    }).reduce(function(a,b){

						if (b) {a.push(b)} // remove empty rows
						return a;

			    }, []);

					_.forEach(photos, function(photo){
						photo.source = 'dropbox';
						// connector.downloadThumbnail(photo, client, user, done);
					});
					if (reply.has_more) {

						console.log('found more');
						return loadDelta(reply.cursor);

					} else {
						
						user.accounts.dropbox.cursor = reply.cursor;
						user.markModified('accounts');

						return user.save(function(err, user){
							return done && done(err, photos);
						});
					}
				});
			};

			return loadDelta(user.accounts.dropbox.cursor);
		});

	};

module.exports = connector;