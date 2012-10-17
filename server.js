var app = require('./app').init(process.env.PORT || 3000);
var passport = require('passport');
var dropbox = require('dbox');
var User = require('./models/user');
var _ = require('underscore');

var ViewModel = require('./routes/viewModel');


require('./routes/share')(app);
require('./routes/photos')(app);
require('./routes/import')(app);
require('./routes/index')(app);


app.get('/users', function(req,res){
  User.find({'$or' : [{displayName : new RegExp(req.query.query + ".*")}, {emails : new RegExp(req.query.query + ".*")}]}, function(err, users){
    users = users.map(function(user){return {_id : user._id, emails : user.emails, displayName : user.displayName}});
    res.end(JSON.stringify(users));
  });
});


/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', new ViewModel());
});


