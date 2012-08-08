var dbox  = require("dbox");
var config = { "app_key": "430zvvgwfjxnj4v", "app_secret": "un2e5d75rkfdeml", root : 'dropbox'};
var dbox  = require("dbox");
var dropbox   = dbox.app(config);

module.exports = function (app) {

	var self = this;

	// TODO: move these to separate routes/controllers
	app.get('/auth/dropbox', function(req,res){


		dropbox.requesttoken(function(status, request_token){
			console.log('token', request_token);
			console.log('request', req);

			app.tokens[request_token.oauth_token] = request_token;

			res.redirect(request_token.authorize_url + "&oauth_callback=http://" + req.headers.host + "/auth/dropbox/callback");

		});

	});

	app.get('/img/thumbnails/:uid/*:path', function(req,res){
		var path = req.url.split(req.params.uid)[1]; // because of a bug in req.params parser i can't use that parameter, i will use url instead
		this.downloadThumbnail(path, req.params.uid, function(err, thumbnail){
			res.end(thumbnail);
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
	});

	this.loadToken = function(uid){

		if (app.tokens[uid])
		{
			return app.tokens[uid];
		}

		var path = __dirname + '/../../tokens/' + uid;
		if (!require('path').existsSync(path))
			return null;

		var token = require('fs').readFileSync(path);
		app.tokens[token.uid] = token; // cache the results
		return token;

	};

	this.saveToken = function(token){
		app.tokens[token.uid] = token; // cache the results
		require('fs').writeFileSync(__dirname + '/../../tokens/' + token.uid, JSON.stringify(token));
	};

	this.downloadThumbnail = function(path, access_token, callback){
		var client = dropbox.client(access_token);
		var filename = __dirname + '/static/img/thumbnails/' + uid + path;
		var fs = require('fs');
		var p = require('path');

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
					callback(err);

				fs.writeFile(filename, thumbnail, function(err){
					if (callback)
						callback(err, thumbnail);
				});

			});
		});
	};

	return this;

};
