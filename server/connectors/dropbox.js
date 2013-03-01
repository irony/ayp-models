var dbox  = require("dbox");
var config = require('../../conf');
var dbox  = require("dbox");
var async  = require("async");
var dropbox   = dbox.app(config.dbox);
var passport = require('passport');
var Connector = require('./connectorBase');
var Photo = require('../../models/photo');
var User = require('../../models/user');
var _ = require('underscore');
var ObjectId = require('mongoose').Types.ObjectId;


var connector = new Connector();

	connector.downloadThumbnail = function(user, photo, done){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done(null, null); // 'Not a dropbox user'


		if (!photo) {
			return done(null, null);
		}


		var filename = photo.source + '/' + photo._id;

		try {
			var client = this.getClient(user);

			return client.thumbnails(photo.path, {size: 'l'},function(status, thumbnail, metadata){

				if (status !== 200){

					if(status === 415) {
						console.log('[415]'); // ' received, removing photo. This is not a photo.');
						photo.remove(console.log);
					}

					if(status === 404) {
						// console.log('[404]'); //' received, it is not a photo?', photo.path);
					}

					return done && done(new Error('Could not download thumbnail from dropbox, error nr ' + status));
				}

				return connector.save('thumbnails', photo, thumbnail, function(err){
					return done(err, thumbnail);
				});

			});
		} catch(err){
			done(err, null);
		}

	};


	connector.downloadOriginal = function(user, photo, done){
		if (!user || !user.accounts || !user.accounts.dropbox)
			return done(new Error('Not a dropbox user'), null); // not a dropbox user


		if (!photo) {
			return done(null, null);
		}

		var client = this.getClient(user);
		//client.media(photo.path, function(status, reply){
		
    // TODO: Replace the code below with the streamed version:
		//
		// return connector.save('originals', photo, client.stream(photo.path), function(err){
		//	 console.log('saved returning...');
		//	 return done(err, photo);
		// });

		client.get(photo.path, function(status, stream){

			if (status !== 200){

				if(status === 415) {
					console.log('[415]'); //' received, removing photo. This is not a photo.', stream);
					photo.remove();
				}

				if(status === 404) {
					console.log('[404]'); //' received, removing photo. It is not found in dropbox.', stream);
					photo.remove();
				}

				return done && done(new Error('Could not download original from dropbox, error nr ' + status));
			}

			return connector.save('originals', photo, stream, function(err){
				return done(err, photo);
			});

		});
	};


	connector.getClient = function(user){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return;
		
		var access_token = {
			"oauth_token_secret"	:  user.accounts.dropbox.tokenSecret,
			"oauth_token"					:  user.accounts.dropbox.token
		};

		var client = dropbox.client(access_token);
		return client;
	};

	connector.downloadAllMetadata = function(user, progress)
	{
		if (!user || !user._id || user.accounts.dropbox === undefined){
			return progress(new Error('Not a valid dropbox user'), null);
		}
		var client = this.getClient(user);

		// console.log('downloading metadata from dropbox for user id', user._id);

    return User.findById(user._id, function(err, user){
			if (err || !user || !user.accounts || !user.accounts.dropbox) return console.log('Error:', err, user);

			/*
			if (user.accounts.dropbox.lastImport)
			{
				var minutes = (new Date().getTime() - user.accounts.dropbox.lastImport.getTime()) / 1000 / 60;
				if (minutes < 1) return console.log('Waiting for import', minutes);
			
				user.accounts.dropbox.lastImport = new Date();
				user.save(console.log);
			}*/




			var client = connector.getClient(user);
			

			if (!user.accounts.dropbox.cursor) console.log('Importing all photos for user', user._id);


			var loadDelta = function(cursor){
				client.delta({cursor : cursor}, function(status, reply){
					if (status !== 200 || !reply)
						return progress(status, null);

			    var photos = (reply.entries || []).map(function(photoRow){
						var photo = photoRow[1];
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
						progress(null, photos);
						return loadDelta(reply.cursor);
					} else {
						user.accounts.dropbox.cursor = reply.cursor;
						user.markModified('accounts');
						return user.save(function(err, user){
							return progress(null, photos);
						});
					}
				});
			};

			return loadDelta(user.accounts.dropbox.cursor);
		});

	};

module.exports = connector;