var ViewModel = require('./viewModel');
var ShareSpan = require('../models/sharespan');
var User = require('../models/user');
var ObjectId = require('mongoose').Types.ObjectId;
var timeago = require('timeago');

module.exports = function(app){


  app.get('/users', function(req,res){
    User.find({'$or' : [{displayName : new RegExp(req.query.query + ".*")}, {emails : new RegExp(req.query.query + ".*")}]}, function(err, users){
      users = users.map(function(user){return {_id : user._id, emails : user.emails, displayName : user.displayName}});
      res.end(JSON.stringify(users));
    });
  });


  app.get('/share', function(req,res){

      var model = new ViewModel(req.user);
      model.date = req.query.date;
      model.description = 'Share photos';
      model.author = req.user.displayName;

      res.render('share.ejs', model);
  });

  app.post('/share', function(req, res){
    var span = new ShareSpan(req.body);

    User.findOne({'emails' : req.body.email}, function(err, user){

      if (!user) {
        var model = new ViewModel(req.user);
        model.error = "User could not be found " + req.body.email;
        res.render('500.ejs', model);
        return;
      }

      span.members = [req.user, user];
      span.startDate = new Date(req.body.daterange.split(' - ')[0].trim());
      span.stopDate = new Date(req.body.daterange.split(' - ')[1].trim());

      span.save(function(err, savedSpan){
        res.redirect('/spans');
      });

    });
  });

  app.get('/spans', function(req, res){

    ShareSpan.find({'members': req.user._id})
    .exec(function(err, spans){

      if (err) {
        throw err;
      }

      spans = spans.map(function(span){
        span.prettyDates = span.startDate + "-" + span.stopDate;
        return span;
      });

      var model = new ViewModel(req.user);
      model.spans = spans;
      res.render('spans.ejs', model);
    });
  });
};
