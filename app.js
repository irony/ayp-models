var mongoose = require('mongoose'),
    UserSchema = require('./models/user.js'),
    mongooseAuth = require('mongoose-auth');

    mongoose.model('User', UserSchema);

mongoose.connect(process.env['MONGOHQ_URL'] || 'mongodb://localhost/allmyphotos');

var    User = mongoose.model('User');




var express = require('express');
var app = express.createServer(
    express.bodyParser()
  , express.static(__dirname + "/static")
  , express.cookieParser()
  , express.session({ secret: 'esoognom'})

    // STEP 2: Add in the Routing
  , mongooseAuth.middleware()

    // IMPORTANT!!!!!!! Do not add app.router, to your middleware chain 
    // explicitly, or you will run into problems accessing `req.user`
    // i.e., do not use app.use(app.router). Let express do this for you
    // automatically for you upon your first app.get or app.post.
);


exports.init = function(port) {


    debugger;

    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.use(express.methodOverride());
        //app.use(app.router);
        app.enable("jsonp callback");
    });

    app.configure('development', function(){
	   app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
        // app.use(express.logger({ format: ':method :url' }));
    });

    app.configure('production', function(){
	   app.use(express.errorHandler()); 
    });


    app.error(function(err, req, res, next){
	   res.render('500.ejs', { locals: { error: err },status: 500 });	
    });

    app.listen(port);

    console.log("Listening on port %d in %s mode", app.address().port, app.settings.env);

    return app;
}