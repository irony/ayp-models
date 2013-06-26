// Cluster photos with k-means
// ===


var ObjectId = require('mongoose').Types.ObjectId,
    Photo = require('../models/photo'),
    User = require('../models/user'),
    async = require('async'),
    emit = {}, // fool jsLint
    clusterfck = require('clusterfck'),
    mongoose = require('mongoose');


module.exports = function(done){

  if (!done) throw new Error("Callback is mandatory");

  // find all users
  User.find().exec(function(err, users){
    
    if (err) throw err;


    async.map((users || []), function(user, userDone){


  
      // find all their photos and sort them on interestingness
      Photo.find({'owners': user._id}, 'taken exif.gps.GPSLongitude exif.gps.GPSLatitude')
      .exists('exif.gps')
      .exec(function(err, photos){
        if (err) throw err;

        async.map(photos, function(photo, done){

          // { GPSLongitude: [ 13, 7.65, 0 ], GPSLatitude: [ 56, 8, 0 ] }

          //if (photo.exif) console.log(photo.exif.gps);
          var vector = [photo.taken.getTime(), photo.exif.gps.GPSLatitude[0], photo.exif.gps.GPSLongitude[0]];
          vector._id = photo._id;
          return done(null, vector);

        },function(err, photos){

          var clusters = clusterfck.kmeans(photos, 10);
          
          clusters.map(function(cluster, i){
            async.map(cluster, function(photo, done){

              var setter = {$set : {}};
              var interestingness = photo.value >= 100 ? photo.value : Math.floor(Math.random()*100);
              
              setter.$set['copies.' + user._id + '.cluster'] = i;
              setter.$set['modified'] = new Date();

              return Photo.findOneAndUpdate({_id : photo._id}, setter, {upsert: true, safe:true}, done);
            }, function(err, results){
              return userDone(err, user);
            });
          });

        });
      });
    }, function(err, users){
      if (!err) console.debug(': Cluster OK %d users', users.length);
      if (done) done(err, users);
    });
  });


};