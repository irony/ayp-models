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

function Clusterer(done){
  var self = this;

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
            Clusterer.extractGroups(user, photos, 100, done);
          },
          function(groups, done){
            async.mapSeries(groups, function(group, done){

              var rankedGroup = Clusterer.rankGroupPhotos(group, 10);
              Clusterer.saveGroupPhotos(rankedGroup, done);

            }, function(err, affectedPhotos){
              done(err, affectedPhotos);
            });
          }
        ],function(err, affectedPhotos){
          userDone(err, affectedPhotos.length && user || null);
        });

      });
    }, function(err, users){

      // if (!err) console.debug(': Cluster OK %d users', users.length);
      if (done) done(err, users);

    });
  });
}


Clusterer.extractGroups = function(user, photos, clusters, done){
  async.map(photos, function(photo, done){
  
  var vector = [photo.taken.getTime()]; // this is where the magic happens

  var mine = new PhotoCopy(photo.copies[user._id] || photo);

  vector._id = photo._id;
  vector.oldCluster = mine.cluster;
  vector.taken = photo.taken;
  vector.vote = mine.vote;
  vector.clicks = mine.clicks;
  vector.interestingness = mine.calculatedInterestingness || Math.floor(Math.random()*100);
  return done(null, vector);

  },function(err, vectors){
    var clusters = vectors && clusterfck.kmeans(vectors.filter(function(a){return a}), clusters);
    var groups = clusters.map(function(cluster){
      var group = new Group();
      group.user = user;
      group.photos = cluster;
      return group;
    });
    return done(err, groups);
  });
};

Clusterer.rankGroupPhotos = function(group, clusters){
    var subClusters = utils.cluster(group.photos, clusters);
    //var subClusters = clusterfck.kmeans(group.photos, clusters);
        console.debug('rank..');
    subClusters
      .sort(function(a,b){
        return b.length - a.length; // sort the arrays bigger first, more value toeacho we get the smallest clusters first - less risk of double shots from the same cluster
      })
      .map(function(subCluster, subGroup){

        subCluster.sort(function(a,b){
          return b.interestingness - a.interestingness;
        }).map(function(photo, i){
          photo.cluster=group._id + "." + subGroup + "." + i;
          photo.boost = 50 / (1+i*2);
          photo.interestingness = Math.floor(photo.boost + (photo.interestingness || 0));
          // || Math.floor(Math.random()*100)); // ) + photo.boost;
          return photo;
        });
        console.debug('subCluster');
        return subCluster;

      });
      //console.debug(subClusters)
        console.debug('..done');

    group.photos = utils.weave(subClusters);
    return group;
};

Clusterer.saveGroupPhotos = function(group, done){
  var i = 1;
  async.mapSeries(group.photos, function(photo, done){

    if (photo.cluster === photo.oldCluster) return done();

    var setter = {$set : {}};
    //var clusterRank = 100 - (i / group.photos.length) * 100;

    setter.$set['copies.' + group.user._id + '.clusterOrder'] = i;
    setter.$set['copies.' + group.user._id + '.interestingness'] = photo.interestingness;
    // + clusterRank + (photo.interestingness); // || Math.floor(Math.random()*100)); // ) + photo.boost;
    setter.$set['copies.' + group.user._id + '.cluster'] = photo.cluster;

    i++;
    Photo.findOneAndUpdate({_id : photo._id}, setter, {upsert: true});
    return done();

  }, function(err, results){
    console.debug('..done', results.length);
    return done(err, results);
  });
};

module.exports = Clusterer;