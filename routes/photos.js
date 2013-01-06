var ViewModel = require('./viewModel');
var Photo = require('../models/photo');
var Group = require('../models/group');
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){

  var s3UrlPrefix = 'http://' + global.s3.bucket + '.' + global.s3.datacenterUrl;

  app.get('/wall', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    res.render('groups.ejs', model);

  });

  app.get('/photos/random/:id', function(req, res){
    if (!req.user){
      return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
    }

    Photo.find({owners: req.user._id})
    .where('originalDownloaded').ne(false)
    .skip(Math.min(req.query.skip || 0))
    .limit(Math.min(req.query.limit || 50))
    .sort('-interestingness')
    .exec(function(err, photos){

      console.log(photos);
      var photo = photos && photos[Math.round(Math.random()*50)];
      if(!photo) {
        return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
      }
 
      res.redirect('/img/originals/' + photo.source + '/' + photo._id);

    });
  });

  app.get('/photoFeed', function(req, res){

    var model = new ViewModel(req.user),
        reverse = req.query.reverse === 'true',
        filter = (reverse) ? {$gte : req.query.startDate} : {$lte : req.query.startDate};

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    Photo.find({'owners': req.user._id})
    .where('taken', filter)
    .where('hidden').ne(true)
    .where('interestingness').gte(99- (req.query.interestingness || 50))
    .sort(reverse ? 'taken' : '-taken')
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 100)
    .exec(function(err, photos){
      if (!photos || !photos.length)
        return res.end(err);


      photos = photos.reduce(function(a,b){
        var diffAverage = 0,
            last = a.length ? a[a.length-1] : null;

        if (last) {
          b.timeDiff = Math.abs(last.taken.getTime() - b.taken.getTime());
          b.diffTotal = (last.diffTotal || 0) + b.timeDiff;
          diffAverage = b.diffTotal / a.length;
        }

        if (a.length <= photos.length / 2 || b.timeDiff < diffAverage * 1.5) a.push(b);

        return a;
      }, []);

      async.map((photos || []), function(photo, done){
        photo.metadata = null;
        if (photo.mimeType.split('/')[0] == 'video'){
          photo.src = s3UrlPrefix + '/originals/' + photo.source + '/' + photo._id;
          return done(null, photo);
        } else {
          photo.src = '/img/thumbnails/' + photo.source + '/' + photo._id;

          var filename = path.resolve('/thumbnails/' + photo.source + '/' + photo._id);
          global.s3.getFile(filename, function(err, res){
            res.on('end', function(data) {
              photo.src = !data ? photo.src : 'data:' + photo.mimeType + ';base64,' + data.toString('base64');
              return done(null, photo);
            });
          });

        }
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


};