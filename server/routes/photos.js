var ViewModel = require('./viewModel');
var Photo = require('../../models/photo');
var Group = require('../../models/group');
var User = require('../../models/user');
var fs = require('fs');
var path = require('path');
var async = require('async');
var clusterfck = require('clusterFck');
var _ = require('lodash');

module.exports = function(app){

  app.get('/me/wall', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    res.render('wall.ejs', model);

  });

  app.get('/me/photos/random/:id', function(req, res){
    if (!req.user){
      return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
    }

    Photo.find({owners: req.user._id}, 'photo.store.originals.url')
    .where('store.originals.stored').exists(true)
    .where('-copies.' + req.user._id + '.calculatedVote', 0)
    .limit(50)
    .sort('-taken')
    .exec(function(err, photos){

      var photo = photos && photos[Math.round(Math.random()*50)];
      if(!photo) {
        return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
      }
 
      res.redirect(photo.store.originals.url);

    });
  });


  app.get('/me/library', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }


    // Get an updated user record for an updated user maxRank.
    User.findOne({_id : req.user._id}, function(err, user){
      Photo.find({'owners': req.user._id}, 'copies.' + req.user._id + ' ratio taken store exif')
      .exists('exif.gps.GPSLongitude')
//      .sort('-copies.' + req.user._id + '.interestingness')
      .sort({'taken': -1})
      .exec(function(err, photos){

        async.map(photos, function(photo, done){

          // { GPSLongitude: [ 13, 7.65, 0 ], GPSLatitude: [ 56, 8, 0 ] }

          //if (photo.exif) console.log(photo.exif.gps);
          var vector = [photo.taken.getTime(), photo.exif.gps.GPSLatitude[0], photo.exif.gps.GPSLongitude[0]];
          vector._id = photo._id;
          vector.src = photo.src;
          vector.ratio = photo.ratio;
          return done(null, vector);

        },function(err, vectors){

          var clusters = clusterfck.kmeans(vectors, 10);
          model.clusters = clusters;
          return res.render('library.ejs', model);

        });
      });
    });


  });


};