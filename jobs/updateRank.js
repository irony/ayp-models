// Update Rank
// ===
// Based on interestingness get the most interesting photos and convert it to a normalized rank value
// which can be used to filter all photos on


var ObjectId = require('mongoose').Types.ObjectId,
    Photo = require('../models/photo'),
    User = require('../models/user'),
    async = require('async'),
    emit = {}, // fool jsLint
    mongoose = require('mongoose');


module.exports = function(done){

  if (!done) throw new Error("Callback is mandatory");

  // find all users
  User.find().exec(function(err, users){
    
    if (err) throw err;
    
    async.mapSeries((users || []), function(user, nextUser){
  
      // console.log('Ranking user id %s...', user._id);

      // find all their photos and sort them on interestingness
      Photo.find({'owners': user._id})
      .sort('-copies.' + user._id + '.interestingness')
      .limit(50000)
      .exec(function(err, photos){
        if (err) throw err;
      
        // console.log('Found %d photos, ranking...', photos.length);

        var rank = 0;
        
        async.map(photos, function(photo, done){

          // closure
          var currentRank = rank++;

          var setter = {$set : {}};
          var mine = photo.copies[user._id];
          setter.$set['copies.' + user._id + '.rank'] = currentRank;
          setter.$set['copies.' + user._id + '.calculatedVote'] = Math.floor(currentRank / photos.length * 10);

          return Photo.findOneAndUpdate({_id : photo._id}, setter, {upsert: true, safe:true}, done);

        },function(err, photos){
          console.log(': OK %d photos', photos.length, err);

          user.maxRank = rank;
          user.save();

          if (nextUser) nextUser(err, user);

        });
      });
    }, function(err, users){
      if (!err) console.log(': OK %d users', users.length);
      if (done) done(err, users);
    });
  });


};