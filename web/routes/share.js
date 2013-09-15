var ViewModel = require('./viewModel');
var ShareSpan = require('AllYourPhotosModels').shareSpan;
var User = require('AllYourPhotosModels').user;
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(app){


  app.get('/users', function(req,res){
    User.find({'$or' : [{displayName : new RegExp(req.query.query + ".*")}, {emails : new RegExp(req.query.query + ".*")}]}, function(err, users){
      users = users.map(function(user){return {_id : user._id, emails : user.emails, displayName : user.displayName}});
      res.end(JSON.stringify(users));
    });
  });


  app.get('/share', function(req,res){

      var model = new ViewModel(req.user);
      model.fromDate = req.query.fromDate || req.query.date && req.query.date.toString().split('T')[0] || new Date().toISOString().split('T')[0];
      model.toDate = req.query.toDate || req.query.date && req.query.date.toString().split('T')[0] || new Date().toISOString().split('T')[0] + " 23:59:59";
      model.description = 'Share photos';
      model.author = req.user.displayName;

      res.render('share.ejs', model);
  });

  app.post('/share', function(req, res){
    var span = new ShareSpan(req.body);

    User.findOne({'emails' : req.body.email}, function(err, toUser){

      if (!toUser) {
        console.log('no user');
        /*
        toUser = new User();
        toUser.emails = [req.body.email];
        toUser.save();
        var model = new ViewModel(req.user);
        model.error = "User could not be found " + req.body.email;
        res.render('500.ejs', model);*/
        return res.send(500, "no such user");
      }

      console.log('sharing user', req.user);

      span.members = [req.user._id, toUser._id];
      span.startDate = new Date(req.body.daterange.split(' - ')[0].trim());
      span.stopDate = new Date(req.body.daterange.split(' - ')[1].trim());

      span.save(function(err, savedSpan){
        console.log('saved span', savedSpan, err);
        if (err)
          return res.send(500, err);
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


  app.get('/span/remove/:id', function(req, res){

    ShareSpan.findById(req.params.id)
    .exec(function(err, span){

      if (err) {
        throw err;
      }

      span.remove(function(){
        res.redirect('/spans');
      });
    });
  });

};
