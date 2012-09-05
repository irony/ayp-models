var app = require('./app').init(process.env.PORT || 3000);
var dropboxConnector = require('./connectors/dropbox')(app);
var instagramConnector = require('./connectors/instagram')(app);
var flickrConnector = require('./connectors/flickr')(app);
var passport = require('passport');
var dropbox = require('dbox');
var Photo = require('./models/photo');
var User = require('./models/user');
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

	Photo.find({'owners': req.user})
  .limit(50)
  .sort('-taken')
  .exec(function(err, photos){
	
    var model = {
      date : new Date().toLocaleDateString(),
      user : req.user,
      description: 'Lots of photos',
      author : req.user.displayName,
      title : req.user ? req.user.displayName + "'s photos" : locals.title,
      photos : photos
    };

		res.render('photos.ejs', model);

	});
});


app.get('/markers', function(req,res){

    var model = {
      date : new Date().toLocaleDateString(),
      user : req.user,
      title : req.user ? req.user.displayName + "'s photos" : locals.title
    };

    res.render('markers.ejs', model);
});


app.get('/import', function(req, res){

	if (!req.user){
		var model = {
      date : locals.date,
      title : locals.title,
      error : 'You have to login first',
		  user : req.user
    };

		return res.render('500.ejs', model);
	}

	if (req.user.accounts && req.user.accounts.dropbox){

		dropboxConnector.downloadAllPhotos(req.user, function(err, photos){
			if (err || !photos)
				throw err;

			Array.prototype.slice.call(photos);

			async.map(photos, function(photo, next){

				Photo.findOne({'source' : photo.source, 'taken' : photo.client_mtime}, function(err, dbPhoto){

					if (!dbPhoto){
						dbPhoto = new Photo();
					}


          dbPhoto.owners = [req.user]; // TODO: push instead of replace

					dbPhoto.source = photo.source;
					dbPhoto.path = photo.path;
					dbPhoto.modified = photo.modified;
					dbPhoto.taken = photo.client_mtime;
					dbPhoto.metadata = photo;
					dbPhoto.bytes = photo.bytes;
					dbPhoto.mimeType = photo.mime_type;

          console.log('saving photo', dbPhoto);

					return dbPhoto.save(function(err, savedPhoto){
            console.log('saved photo', err);
						return next(null, savedPhoto);
					});
				});
			}, function(err, photos){
        if (err)
          throw err;

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


