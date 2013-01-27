var ObjectId = require('mongoose').Types.ObjectId,
    timeago = require('timeago'),
    Photo = require('../models/photo'),
    async = require('async'),
    emit = {}, // fool jsLint
    mongoose = require('mongoose');



module.exports = function(){

  var map = function(){

    var self = this;

    for(var i in self.copies){

      var copy = self.copies[i];

      emit(copy.user, {id: self._id, interestingness: copy.interestingness});

      /*
      1 : 1:100
      2 : 1:50
      3 : 1:0
      4 : 1:250

      1 : 2:175
      2 : 2:20
      3 : 2:5
      4 : 2:150

      => 1: [4,1,2,3], 2: [1,4,2,3]
      */

    }

  };

  var reduce = function(userId, photos){

    var returnValue = 0;
    var count = 0;
    var result = photos.sort(function(a,b){
      return b.interestingness - a.interestingness;
    }).map(function(photo){
      return photo.id;
    });

    return {toplist: result, userId : userId, count: result.length};
  };

  console.log('Starting map/reduce ranking...');

// add query to only reduce modified images
  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'ranking'}, verbose: true}, function(err, model, stats){

    console.log('Done with ranking.', stats);

    if (err) throw err;

    model.find(function(err, ranking){
      ranking.forEach(function(photoRank){
        var userId = photoRank._id;

        console.log('update rank for user ', userId, photoRank);

        var photos = photoRank.value.toplist;
        var maxRank = photos.length;
        var rank = 0;
        
        photos.forEach(function(photoId){
          rank++;

          var setter = {$set : {}};
          var normalizedRank = ((maxRank - rank) / maxRank) * 100;
          setter.$set['copies.rank'] = normalizedRank;
          setter.$set['copies.top'] = rank;

          Photo.update({_id : photoId}, setter, function(err, photo){
            if (err) console.log('error when updating rank:', err);
          });
        });
      });

    });
  });


};