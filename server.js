var app = require('./app').init(process.env.PORT || 3000);
var dropboxConnector = require('./connectors/dropbox')(app);
var instagramConnector = require('./connectors/instagram')(app);
var flickrConnector = require('./connectors/flickr')(app);
var passport = require('passport');
var dropbox = require('dbox');
var Photo = require('./models/photo');
var async = require('async');

var locals = {
        title: 		 'All My Photos',
        description: 'One place to rule them all',
        author: 	 'Christian Landgren'
    };

app.get('/', function(req,res){

    locals.date = new Date().toLocaleDateString();
    locals.user = req.user;
    locals.title = req.user ? req.user.displayName + "'s photos" : locals.title;

    debugger;

    res.render('template.ejs', locals);
});


// TODO: move these to mongodb
app.tokens = [];
app.accessTokens = [];

app.get('/photos', function(req, res){

	if (!req.user){
		var model = locals;
		model.error = 'You have to login first';
		model.user = req.user;
		return res.render('500.ejs', model);
	}

	Photo.find({'owners' : req.user}, function(err, photos){
	
		res.render('photos.ejs', {title: 'Photos', author: req.user.displayName, date : new Date(), description: 'Lots of photos', photos: photos, user : req.user});

	});
});


app.get('/markers', function(req,res){

    locals.date = new Date().toLocaleDateString();
    locals.user = req.user;
    locals.title = req.user ? req.user.displayName + "'s photos" : locals.title;

    res.render('markers.ejs', locals);
});


app.get('/import', function(req, res){

	if (!req.user){
		var model = locals;
		model.error = 'You have to login first';
		model.user = req.user;
		return res.render('500.ejs', model);
	}

	if (req.user.accounts && req.user.accounts.dropbox){

		dropboxConnector.downloadAllPhotos(req.user, function(err, photos){
			if (err || !photos)
				throw err;

			Array.prototype.slice.call(photos);

			async.map(photos, function(photo, next){

				Photo.findOne({'source' : photo.source, 'path': photo.path, 'modified' : photo.modified}, function(err, dbPhoto){

					debugger;					

					if (!dbPhoto){
						dbPhoto = new Photo();
						dbPhoto.owners = [req.user];
					}

					dbPhoto.source = photo.source;
					dbPhoto.path = photo.path;
					dbPhoto.modified = photo.modified;
					dbPhoto.taken = photo.client_mtime;
					dbPhoto.metadata = photo;
					dbPhoto.bytes = photo.bytes;
					dbPhoto.mimeType = photo.mime_type;

					return dbPhoto.save(function(err, savedPhoto){
						return next(err, savedPhoto);
					});
				});
			}, function(err, photos){
				if (!err)
					res.redirect('/photos');
			});


		});
	} else{
		throw "No compatible accounts are connected to this user";
	}


});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});


