var app = require('./app').init(process.env.PORT || 3000);
var dropboxConnector = require('./connectors/dropbox')(app);
var instagramConnector = require('./connectors/instagram')(app);
var passport = require('passport');

var locals = {
        title: 		 'All My Photos',
        description: 'One place to rule them all',
        author: 	 'Christian Landgren'
    };

app.get('/', function(req,res){

    locals.date = new Date().toLocaleDateString();

    res.render('template.ejs', locals);
});


// TODO: move these to mongodb
app.tokens = [];
app.accessTokens = [];




app.get('/photos', function(req, res){


	// TODO: load from database and move these to import class instead
	var access_token = loadToken(req.query.uid);

	var client = dropbox.client(access_token);
	client.search("/Photos", "jpg", function(status, reply){
		var model = locals;
		model.photos = Array.prototype.slice.call(reply);
		model.uid = req.query.uid;

		var access_token = loadToken(model.uid);

		model.photos.forEach(function(photo){
			dropboxConnector.downloadThumbnail(photo.path, access_token);
		});

		res.render('photos.ejs', model);
	});

});



/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});