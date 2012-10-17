var app = require('./app').init(process.env.PORT || 3000);
var dropboxConnector = require('./connectors/dropbox')(app);
var instagramConnector = require('./connectors/instagram')(app);
var flickrConnector = require('./connectors/flickr')(app);
var passport = require('passport');
var dropbox = require('dbox');
var Photo = require('./models/photo');
var User = require('./models/user');
var ShareSpan = require('./models/sharespan');
var async = require('async');

var locals = {
    title: 'All Your Photos',
    description: 'One place to rule them all',
    author: 'Christian Landgren'
};

var Model = function(){
  // clone default values and create a new model
  return JSON.parse(JSON.stringify(locals));
};

app.get('/', function(req,res){

    var model = new Model();
    model.date = new Date().toLocaleDateString();
    model.user = req.user;
    model.title = req.user ? req.user.displayName + "'s photos" : locals.title;

    res.render('template.ejs', model);
});

app.get('/photos', function(req, res){

	if (!req.user){
		var model = new Model();
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


app.post('/photoRange', function(req, res){

  console.log('photorange');

  if (!req.user){
    var model = new Model();
    model.error = 'You have to login first';
    model.user = req.user;
    return res.render('500.ejs', model);
  }

  console.log('photorange user', req.body);
  
  if (!req.body.dateRange){
    return res.end();
  }

  var startDate = req.body.dateRange.split(' - ')[0];
  var stopDate = req.body.dateRange.split(' - ')[1];

  console.log('startdate', startDate);
  console.log('stopdate', stopDate);

  Photo.find({'owners': req.user})
  .limit(50)
  .where('taken').gte(startDate).lte(stopDate)
  .sort('-taken')
  .exec(function(err, photos){
    photos = photos.map(function(photo){
      return '/img/thumbnails/' + photo.source + '/' + photo._id;
    });
    res.end(JSON.stringify(photos));
  });
});


app.get('/share', function(req,res){

    var model = {
      date : req.query.date,
      user : req.user,
      description: 'Share photos',
      author : req.user.displayName,
      title : req.user ? req.user.displayName + "'s photos" : locals.title
    };

    res.render('share.ejs', model);
});

app.post('/share', function(req, res){
  var span = new ShareSpan(req.body);

  User.findOne({'emails' : req.body.email}, function(err, user){

    if (!user) throw new Error("User could not be found ", req.body.email);

    span.members = [req.user, user];
    span.startDate = new Date(req.body.daterange.split(' - ')[0].trim());
    span.stopDate = new Date(req.body.daterange.split(' - ')[1].trim());

    span.save(function(err, savedSpan){
      res.redirect('/spans');
    });

  });
});

app.get('/spans', function(req, res){
  ShareSpan.find({'members': req.user}, function(err, spans){

    if (err)
      throw err;

    var model = new Model();
    model.spans = spans;
    res.render('spans.ejs', model);
  });
});


app.get('/users', function(req,res){
  User.find({'$or' : [{displayName : new RegExp(req.query.query + ".*")}, {emails : new RegExp(req.query.query + ".*")}]}, function(err, users){
    users = users.map(function(user){return {_id : user._id, emails : user.emails, displayName : user.displayName}});
    res.end(JSON.stringify(users));
  });
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


