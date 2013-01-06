var dbox  = require("dbox");
var config = require('../conf').dbox;
var dbox  = require("dbox");
var async  = require("async");
var dropbox   = dbox.app(config);
var passport = require('passport');
var Connector = require('./connectorBase');
var Photo = require('../models/photo');
var User = require('../models/user');
var _ = require('underscore');
var ObjectId = require('mongoose').Types.ObjectId;


var connector = new Connector();

	connector.downloadThumbnail = function(user, photo, done){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done('Not a dropbox user', null);


		if (!photo) {
			return null;
		}


		var filename = photo.source + '/' + photo._id;

		//if (p.existsSync(filename)) //TODO: add force download switch
	//		return;
		var client = this.getClient(user);

		client.thumbnails(photo.path, {size: 'l'},function(status, thumbnail, metadata){

			if (status !== 200){

				if(status === 415) {
					console.log('415 received, removing photo. This is not a photo.');
					photo.remove(console.log);
				}

				if(status === 404) {
					console.log('404 received, it is not a photo?', photo.path);
				}


				if (done && status) {
					return done(new Error('Could not download thumbnail from dropbox, error nr ' + status));
				}

				
				console.log('error downloading thumbnail', status, thumbnail);
				return;
			}

			connector.save('thumbnails', photo, thumbnail, function(err){
				return done(err, thumbnail);
			});

		});
	};


	connector.downloadPhoto = function(user, photo, done){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return done('Not a dropbox user', null);


		if (!photo) {
			return null;
		}

		var client = this.getClient(user);
		client.media(photo.path, function(status, reply){


			if (status !== 200){

				if(status === 415) {
					console.log('415 received, removing photo. This is not a photo.', reply);
					photo.remove();
				}

				if(status === 404) {
					console.log('404 received, removing photo. It is not found in dropbox.', reply);
					photo.remove();
				}

				if (done && status) {
					return done(new Error('Could not download thumbnail from dropbox, error nr ' + status));
				}
				
				console.log('error downloading image', status, reply);
				return;
			}

			// user will continue while we download the actual file
			done(null, reply);
/*
			client.get(photo.path, function(status, reply){
				


				connector.save('originals', photo, reply, function(err){
						photo.set('originalDownloaded', true);
						photo.save(function(saveErr){
							if (err || saveErr) console.log('error downloading photo', err, saveErr);
						});
					});

			});*/
		});
	};


	connector.getClient = function(user){

		if (!user || !user.accounts || !user.accounts.dropbox)
			return;
		
		// TODO: load from database and move these to import class instead
		var access_token = {
			"oauth_token_secret"	:  user.accounts.dropbox.tokenSecret,
			"oauth_token"			:  user.accounts.dropbox.token
		};

		var client = dropbox.client(access_token);
		return client;
	};

	connector.downloadAllMetadata = function(user, progress)
	{
		if (!user || user.accounts.dropbox != undefined){
			return progress('Not dropbox folder', null);
		}
		var client = this.getClient(user);


    User.findById(new ObjectId(user._id), function(err, user){
    	if (err || !user ) console.log('Error:', err, user);
			var client = connector.getClient(user);
			
			console.log('getting all photo dirs', user.accounts.dropbox.cursor);


			var loadMore = function(cursor){
				client.delta({cursor : cursor}, function(status, reply){
			    var photos = reply.entries.map(function(photoRow){
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
						loadMore(reply.cursor);
					} else {
						user.accounts.dropbox.cursor = reply.cursor;
						user.save(function(err, user){
							console.log('updated user with cursor', reply.cursor, err);
							return progress(null, photos);
						});
					}
				});
			};

			loadMore(user.accounts.dropbox.cursor);
		});

	};

module.exports = connector;