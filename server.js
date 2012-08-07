var app = require('./app').init(process.env.PORT || 3000);
var dbox  = require("dbox");
var config = { "app_key": "430zvvgwfjxnj4v", "app_secret": "un2e5d75rkfdeml", root : 'dropbox'};
var dropbox   = dbox.app(config);

var locals = {
        title: 		 'All My Photos',
        description: 'One place to rule them all',
        author: 	 'Christian Landgren'
    };

app.tokens = [];

var loadToken = function(uid){

	if (app.tokens[uid])
	{
		return app.tokens[uid];
	}

	var path = __dirname + '/tokens/' + uid;
	if (!require('path').existsSync(path))
		return null;

	var token = require('fs').readFileSync(path);
	app.tokens[token.uid] = token; // cache the results
	return token;

};

var saveToken = function(token){
	app.tokens[token.uid] = token; // cache the results
	require('fs').writeFileSync(__dirname + '/tokens/' + token.uid, JSON.stringify(token));
};

		
app.get('/', function(req,res){

    locals.date = new Date().toLocaleDateString();

    res.render('template.ejs', locals);
});


// TODO: move these to mongodb
app.tokens = [];
app.accessTokens = [];


// TODO: move these to separate routes/controllers
app.get('/dropbox', function(req,res){


	dropbox.requesttoken(function(status, request_token){
		console.log('token', request_token);
		console.log('request', req);

		app.tokens[request_token.oauth_token] = request_token;

		res.redirect(request_token.authorize_url + "&oauth_callback=http://" + req.headers.host + "/dropbox-connect");

	});

});

// TODO: move these to separate dropbox class
var downloadThumbnail = function(path, uid, callback){
	var access_token = loadToken(uid);
	var client = dropbox.client(access_token);
	var filename = __dirname + '/static/img/thumbnails/' + uid + path; // strange bug in routing clips last char from path
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

app.get('/img/thumbnails/:uid/*:path', function(req,res){
	var path = req.url.split(req.params.uid)[1]; // because of a bug in req.params parser i can't use that parameter, i will use url instead
	downloadThumbnail(path, req.params.uid, function(err, thumbnail){
		res.end(thumbnail);
	});
});

app.get('/photos', function(req, res){


	// TODO: load from database and move these to import class instead
	var access_token = loadToken(req.query.uid);

	var client = dropbox.client(access_token);
	client.search("/Photos", "jpg", function(status, reply){
		var model = locals;
		model.photos = Array.prototype.slice.call(reply);
		model.uid = req.query.uid;


		model.photos.forEach(function(photo){
			downloadThumbnail(photo.path, model.uid);
		});

		res.render('photos.ejs', model);
	});

});

// TODO: move to separate dropbox controller / route
app.get('/dropbox-connect', function(req, res){
	// app.session.dropboxUid = req.body.uid;
	var token = (req.query || req.body).oauth_token;
	var request_token = app.tokens[token];
	
	console.log(request_token);
	dropbox.accesstoken(request_token, function(status, access_token){
		console.log('access', status, access_token);
		if (status == 200)
		{
			saveToken(access_token);
			res.redirect('/photos?uid=' + access_token.uid);
		}
		else{
			locals.error = status + ", error when connecting with DropBox";
			res.render("500.ejs", locals);
		}
	});
});


/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});