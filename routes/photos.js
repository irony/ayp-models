var ViewModel = require('./viewModel');
var Photo = require('../models/photo');
var Group = require('../models/group');
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){


  app.get('/photos', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    res.render('photos.ejs', model);

  });



  app.get('/groups', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    res.render('groups.ejs', model);

  });

  app.get('/groupFeed', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }


    Group.find({_id : new RegExp(req.user._id + "/.*")})
    .where('value.interestingness').gte(100- (req.query.interestingness || 50))
    .where('value.hidden').ne(true)
    .sort({'value.taken': '-1'})
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 1000)
    .exec(function(err, groups){
      if (!groups)
        return res.end();

      async.map((groups || []), function(group, done){

        var photo = group.value;
        var id = group._id.split('/').splice(1).splice(0,3).join('/');
        photo.groups = (photo.groups || []);
        photo.groups.push(id);

        photo.metadata = null;
        photo.src =  '/img/thumbnails/' + photo.source + '/' + photo._id;
        return done(null, photo);

      }, function(err, photos){

        return res.json(photos);
      });
    });

  });


  app.get('/photos/random/:id', function(req, res){
    if (!req.user){
      return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
    }

    Photo.find({owners: req.user._id})
    .skip(Math.min(req.query.skip || 0))
    .limit(Math.min(req.query.limit || 50))
    .sort('-interstingness')
    .exec(function(err, photos){

      var photo = photos[Math.round(Math.random()*50)];
      if(photo) {
        return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
      }
 
      res.redirect('/img/thumbnails/' + photo.source + '/' + photo._id);

    });
  });

  app.get('/photoFeed', function(req, res){

    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    Photo.find({'owners': req.user._id})
    .where('taken').lt(req.query.startDate || new Date())
    .where('interestingness').gte(100- (req.query.interestingness || 50))
    .where('hidden').ne(true)
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 100)
    .sort('-taken')
    .exec(function(err, photos){
      console.log(req.query, photos.length)
      if (!photos)
        return res.end();

      async.map((photos || []), function(photo, done){
        photo.metadata = null;
        var filename = path.resolve(__dirname + '/../static/img/thumbnails/' + photo.source + '/' + photo._id);
        fs.readFile(filename, function(err, data){
          photo.src = err ? '/img/thumbnails/' + photo.source + '/' + photo._id : 'data:image/jpeg;base64,' + data.toString('base64');
          return done(null, photo);
        });
      }, function(err, photos){
        return res.json(photos);
      });
    });
  });

  app.post('/photoRange', function(req, res){

    var startDate = req.body.dateRange.split(' - ')[0],
    stopDate = req.body.dateRange.split(' - ')[1],
    model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    if (!req.body.dateRange){
      return res.end();
    }

    Photo.find({'owners': req.user._id})
    .limit(500)
    .where('taken').gte(startDate).lte(stopDate)
    .sort('-taken')
    .exec(function(err, photos){
      photos = (photos||[]).map(function(photo){
        return '/img/thumbnails/' + photo.source + '/' + photo._id;
      });
      res.end(JSON.stringify(photos));
    });
  });


};