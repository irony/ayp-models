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
    .sort('-copies.' + req.user._id + '.interestingness')
    .exec(function(err, photos){

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
      throw new Error('You have to login first');
    }

    var maxRank = req.user.maxRank || 1500;
    var limitRank = maxRank * req.query.interestingness / 100;
    console.log('searching photos:', req.query);

    Photo.find({'owners': req.user._id})
    .where('taken', filter)
    .where('copies.' + req.user._id + '.hidden').ne(true)
    //.where('store.thumbnails.stored').exists()
    .where('copies.' + req.user._id + '.rank').lte(limitRank)
    .sort((reverse ? '':'-') + 'taken')
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 100)
    .exec(function(err, photos){
      if (!photos || !photos.length){
        return res.json(photos);
      }

      console.log('found %d photos', photos.length);
/*
      photos = photos.reduce(function(a,b){
        var diffAverage = 0,
            last = a.length ? a[a.length-1] : null;

        if (last) {
          b.timeDiff = Math.abs(last.taken.getTime() - b.taken.getTime());
          b.diffTotal = (last.diffTotal || 0) + b.timeDiff;
          diffAverage = b.diffTotal / a.length;
        }

        // Allow at least half of the photos in the group.
        // And then only add photos which similar time diff compared to the rest of the photos
        // This is to prevent "horungar" from being added to a group
        if (a.length <= photos.length / 2 || b.timeDiff < diffAverage * 1.5) a.push(b);

        return a;
      }, []);
*/


      async.map((photos || []), function(photo, done){

        delete photo.copies[req.user._id]._id; // the _id of the subdocument shouldn't replace the id of the photo
        photo = _.extend(photo, photo.copies[req.user._id]); // only use this user's personal settings

        delete photo.copies; // and remove all other copies
        delete photo.metadata;

        if (photo.mimeType.split('/')[0] === 'video'){
          photo.src = s3UrlPrefix + '/originals/' + photo.source + '/' + photo._id;
          return done(null, photo);
        } else {
          photo.src = photo.store && photo.store.thumbnails ? photo.store.thumbnails.url : '/img/noimg.png';
          return done(null, photo);
/*
          var filename = path.resolve('/thumbnails/' + photo.source + '/' + photo._id);
          global.s3.get(filename).on('response', function(res){
            if (res.statusCode != 200 )
              return done(null, photo);

            var buffer = '';
            res.on('data', function(data) {
              buffer += data.toString('base64');
            });
            res.on('end', function(){
              photo.src = !buffer.length ? photo.src : 'data:' + photo.mimeType + ';base64,' + buffer;
              return done(null, photo);
            });
          }).end();
*/
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
        photo.src = photo.store && photo.store.thumbnails && photo.store.thumbnails.url || '/img/thumbnails/' + photo.source + '/' + photo._id;
        return done(null, photo);
      }, function(err, photos){
        return res.json(photos);
      });


    });
  });


};