var app = require('./app').init(process.env.PORT || 3000);
var dropboxConnector = require('./connectors/dropbox')(app);
var instagramConnector = require('./connectors/instagram')(app);
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
    locals.title = req.session.passport.user ? req.session.passport.user.displayName + "'s photos" : locals.title;
console.log('session', req.session);

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

	if (req.user.accounts.dropbox){

		dropboxConnector.downloadAllPhotos(req.user, function(err, photos){
			if (err)
				return res.render('500.ejs', err);

			async.map(photos, function(photo, next){
				console.log('photo:', photo);

				Photo.findOne({'source' : photo.source, 'fileName': photo.fileName, 'date' : photo.date}, function(err, dbPhoto){
					if (!dbPhoto)
						dbPhoto = new Photo(photo);

					dbPhoto.update(photo);
					dbPhoto.save();
					next(dbPhoto);
				});
			}, function(err, photos){
				res.render('photos.ejs', {photos: photos});
			});
		});
	} else{
		throw "No compatible accounts are connected to this user"
	}


});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});