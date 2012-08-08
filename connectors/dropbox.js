var dbox  = require("dbox");

module.exports = function (app) {




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
