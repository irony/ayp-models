var ViewModel = require('./viewModel');
var Photo = require('AllYourPhotosModels').photo;
var Group = require('AllYourPhotosModels').group;
var User = require('AllYourPhotosModels').user;
var fs = require('fs');
var path = require('path');
var async = require('async');
var clusterfck = require('clusterfck');
var _ = require('lodash');

module.exports = function(app){

  app.get('/me/wall', function(req, res){
    var model = new ViewModel(req.user);

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


  app.get('/me/gps', function(req, res){
    var model = new ViewModel(req.user);


    // Get an updated user record for an updated user maxRank.
    User.findOne({_id : req.user._id}, function(err, user){
      Photo.find({'owners': req.user._id}, 'copies.' + req.user._id + ' ratio taken store exif')
      .exists('exif.gps')
//      .sort('-copies.' + req.user._id + '.interestingness')
      .sort({'taken': -1})
      .exec(function(err, photos){

        async.map(photos, function(photo, done){
          try{
            // { GPSLongitude: [ 13, 7.65, 0 ], GPSLatitude: [ 56, 8, 0 ] }
            if (!photo.exif.gps || photo.exif.gps === {}) return done();

            if (photo.exif.gps.length){
              photo.exif.gps = photo.exif.gps.reduce(function(gps, tag){
                gps[tag.tagName] = tag.value;
                return gps;
              }, {});
            }
            var vector = [photo.exif.gps.GPSLatitude[0], photo.exif.gps.GPSLongitude[0]];
            vector._id = photo._id;
            vector.src = photo.src;
            vector.ratio = photo.ratio;
            return done(null, vector);
          }
          catch(err){
            console.log('err:', err);
            return done();
          }

        },function(err, vectors){
          
          console.log(vectors.slice(0,10));

          var clusters = clusterfck.kmeans(vectors.filter(function(a){return a}), 100);
          model.clusters = clusters;
          return res.render('library.ejs', model);

        });
      });
    });


  });


  app.get('/me/time', function(req, res){
    var model = new ViewModel(req.user);

    // Get an updated user record for an updated user maxRank.
    User.findOne({_id : req.user._id}, function(err, user){
    console.log('me/user')
      Photo.find({'owners': req.user._id}, 'copies.' + req.user._id + ' ratio taken store')
      // .exists('exif.gps')
//      .sort('-copies.' + req.user._id + '.interestingness')
      .sort({'taken': -1})
      .exec(function(err, photos){
    console.log('me/photos', photos)

        async.map(photos, function(photo, done){
          try{
            var vector = [photo.taken.getTime()];
            vector._id = photo._id;
            vector.src = photo.src;
            vector.ratio = photo.ratio;
            vector.vote = photo.copies[req.user._id].vote || photo.copies[req.user._id].calculatedVote;
            return done(null, vector);
          }
          catch(err){
            console.log('err:', err);
            return done();
          }

        },function(err, vectors){
          
          console.log(vectors.slice(0,10));

          var clusters = clusterfck.kmeans(vectors.filter(function(a){return a}), 100);

          clusters.map(function(cluster){
            var subClusters = clusterfck.kmeans(cluster, 5);
            subClusters.map(function(subCluster, group, i){

              // Weave the groups
              subCluster.sort(function(a,b){
                return a.vote - b.vote;
              });

            }).sort(function(a,b){
              return b.length - a.length; // sort the arrays so we get the longest cluster first - that is probably our best shot!
            });

            /*var rankedPhotos = utils.weave(subClusters);
            rankedPhotos.map(function(photo, i){
              photo.interestingness = 100 - (i/rankedPhotos.length) * 100;
            });
            */
          });
          
          model.clusters = clusters;
          return res.render('library.ejs', model);

        });
      });
    });


  });


};