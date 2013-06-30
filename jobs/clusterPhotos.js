// Cluster photos with k-means
// ===


var ObjectId = require('mongoose').Types.ObjectId,
    Photo = require('../models/photo'),
    PhotoCopy = require('../models/photoCopy'),
    Group = require('../models/group'),
    User = require('../models/user'),
    async = require('async'),
    emit = {}, // fool jsLint
    _ = require('lodash'),
    utils = new require('../client/js/utils')(_),
    clusterfck = require('clusterfck'),
    mongoose = require('mongoose');


module.exports = function(done){
  var self = this;

  this.extractGroups = function(user, photos, done){
    async.map(photos, function(photo, done){
      try{
        
        var vector = [photo.taken.getTime()]; // this is where the magic happens

        var mine = new PhotoCopy(photo.copies[user._id]);

        vector._id = photo._id;
        vector.interestingness = mine.calculatedInterestingness;
        vector.oldCluster = mine.cluster;
        vector.taken = photo.taken;
        return done(null, vector);
      }
      catch(err){
        console.log('err:', err);
        return done();
      }

    },function(err, vectors){
      var clusters = vectors && clusterfck.kmeans(vectors.filter(function(a){return a}), 100);
      var groups = clusters.map(function(cluster){
        var group = new Group();
        group.user = user;
        group.photos = cluster;
      });
      return done(err, groups);
    });
  };

  this.rankGroupPhotos = function(group, done){
      console.log(arguments)
      var subClusters = clusterfck.kmeans(group.photos, 10);
      // console.log('# clusters', subClusters.length);
      subClusters
        .sort(function(a,b){
          return a.length - b.length; // sort the arrays so we get the smallest clusters first - less risk of double shots from the same cluster
        })
        .map(function(subCluster, subGroup){

          subCluster.sort(function(a,b){
            return b.interestingness - a.interestingness;
          }).forEach(function(photo, i){
            photo.cluster=group._id + "." + subGroup + "." + i;
            photo.boost = 50 / (1+i);
          });

        });

      group.photos = utils.weave(subClusters);
      return group;
  };

  this.saveGroupPhotos = function(group, done){
    var i = 1;
    async.mapSeries(group.photos, function(photo, done){

      // if (photo.cluster === photo.oldCluster) return done();

      var setter = {$set : {}};
      var clusterRank = 100 - (i / group.photos.length) * 100;

      setter.$set['copies.' + group.user._id + '.clusterOrder'] = i;
      setter.$set['copies.' + group.user._id + '.interestingness'] = clusterRank + (photo.interestingness); // || Math.floor(Math.random()*100)); // ) + photo.boost;
      setter.$set['copies.' + group.user._id + '.cluster'] = photo.cluster;

      i++;
      return Photo.findOneAndUpdate({_id : photo._id}, setter, {upsert: true}, done);

    }, done);
  };


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

        async.waterfall([
          function(done){
            self.extractGroups(user, photos, done);
          },
          function(groups, done){
            async.mapSeries(groups, function(group, done){

              var rankedGroup = self.rankGroupPhotos(group, done);
              self.saveGroupPhotos(rankedGroup, done);

            }, function(err, affectedPhotos){
              done(err, affectedPhotos);
            });
          }
        ],function(affectedPhotos, done){
          userDone(err, _(affectedPhotos).compact().value().length && user || null);
        });

      });

    }, function(err, users){
      // if (!err) console.debug(': Cluster OK %d users', users.length);
      if (done) done(err, _(users).flatten().compact().select('_id').value());
    });
  });


};