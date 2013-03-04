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
    
    async.map((users || []), function(user, userDone){
  
      // find all their photos and sort them on interestingness
      Photo.find({'owners': user._id}, 'copies.' + user._id + '.rank ')
      //.sort('-copies.' + user._id + '.interestingness')
      .limit(5000)
      .exec(function(err, photos){
        if (err) throw err;
      
        var rank = 0;
        
        // no meaning to rank too few photos
        if (photos.length < 30) return userDone();

        async.map(photos, function(photo, done){
          if (!photo || !photo.copies) return done();

          // closure
          var newRank = rank++;
          var mine = photo.copies[user._id];

          // No noticable different (less than 1% change)
          if (!mine || Math.floor(newRank / 10) === Math.floor(mine.rank / 10)){
            return done();
          }

          // console.log('updating rank', photo._id, newRank / 100, mine.rank / 100);

          var setter = {$set : {}};
          setter.$set['copies.' + user._id + '.rank'] = newRank;
          setter.$set['copies.' + user._id + '.calculatedVote'] = Math.floor(newRank / photos.length * 10);
          setter.$set['copies.' + user._id + '.calculated'] = new Date();

          return Photo.findOneAndUpdate({_id : photo._id}, setter, {upsert: true, safe:true}, done);

        },function(err, photos){

          if (photos.length){
            user.maxRank = rank;
            user.save();
          }

          return userDone(err, user);

        });
      });
    }, function(err, users){
      if (!err) console.debug(': Rank OK %d users', users.length);
      if (done) done(err, users);
    });
  });


};