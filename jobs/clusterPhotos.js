// Cluster photos with k-means
// ===


var ObjectId = require('mongoose').Types.ObjectId,
    Photo = require('../models/photo'),
    User = require('../models/user'),
    async = require('async'),
    emit = {}, // fool jsLint
    _ = require('lodash'),
    utils = new require('../client/js/utils')(_),
    clusterfck = require('clusterfck'),
    mongoose = require('mongoose');


module.exports = function(done){

  if (!done) throw new Error("Callback is mandatory");

  // find all users
  User.find().exec(function(err, users){
    
    if (err) throw err;


    async.map((users || []), function(user, userDone){


      // find all their photos and sort them on interestingness
      Photo.find({'owners': user._id}, 'taken copies.' + user._id + '.calculatedVote copies.' + user._id + '.vote')
      // .where('copies.' + user._id + '.clusterOrder').exists(false)
      .sort({ taken : -1 })
      .exec(function(err, photos){
        if (err) throw err;

        async.map(photos, function(photo, done){
          try{
            var vector = [photo.taken.getTime()];
            vector._id = photo._id;
            vector.vote = photo.copies[user._id].vote || photo.copies[user._id].calculatedVote;
            return done(null, vector);
          }
          catch(err){
            console.log('err:', err);
            return done();
          }

        },function(err, vectors){
          
          var clusters = clusterfck.kmeans(vectors.filter(function(a){return a}), 100);
          var clusterId = 0;

          async.map(clusters, function(cluster, done){
            var subClusters = clusterfck.kmeans(cluster, 5);
            
            clusterId++;
            subClusters
              .sort(function(a,b){
                return b.length - a.length; // sort the arrays so we get the longest cluster first - that is probably our best shot!
              })
              .map(function(subCluster, group){

                subCluster.sort(function(a,b){
                  return a.vote - b.vote;
                }).forEach(function(photo, i){
                  photo.cluster=clusterId + "." + group + i;
                });

              });

            var rankedPhotos = utils.weave(subClusters);
            var i = 0;
            async.map(rankedPhotos, function(photo, done){
              var setter = {$set : {}};
              var interestingness = photo.value >= 100 ? photo.value : Math.floor(Math.random()*100);
              var clusterRank = (i/rankedPhotos.length) * 100;

              setter.$set['copies.' + user._id + '.clusterOrder'] = clusterRank;
              setter.$set['copies.' + user._id + '.cluster'] = photo.cluster;
              i++;

              return Photo.findOneAndUpdate({_id : photo._id}, setter, {upsert: true}, done);

            }, userDone);

          });
          
        });
      });
    }, function(err, users){
      // if (!err) console.debug(': Cluster OK %d users', users.length);
      if (done) done(err, users);
    });
  });


};