// Calculate Interestingness
// ===
// A job to calculate interestingness for all photos by all users

var ObjectId = require('mongoose').Types.ObjectId,
    timeago = require('timeago'),
    Photo = require('../models/photo'),
    async = require('async'),
    emit = {}, // fool jsLint
    mongoose = require('mongoose');



module.exports = function(){

  // Emit each relevant source of information
  var map = function(){

    var self = this;

    for(var user in self.copies){
      if (user && self.copies && self.copies[user]){

        var group = user + "/" + self._id;
        if(self.copies[user].hidden) emit(group, 0);

        if(self.copies[user].starred) emit(group, 100);
        if(self.copies[user].views) emit(group, (0.5 + self.copies[user].views / 10)*100);
        
        if(self.copies[user].clicks) emit(group, (0.8 + self.copies[user].clicks / 3)*100);

        if(self.tags && self.tags.length) emit(group, (0.5 + self.tags.length / 2)*100);
        if(self.copies[user].groups && self.copies[user].groups.length) emit(group, (0.6 + self.copies[user].groups / 2)*100);
      }
    }

  };

  // Calculate a sum per photo
  var reduce = function(group, actions){

    var returnValue = 0;
    var count = 0;
    actions.forEach(function(action){
      returnValue += action.value;
      count++;
    });

    return Math.round(parseFloat(returnValue / count));
  };

  console.log('Starting map/reduce interestingness...');

  // Start the map / reduce job
  // - - -
  // TODO: add query to only reduce modified images
  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'interestingness'}, verbose: true}, function(err, model, stats){

    console.log('Done with map/reduce.', stats);

    if (err) throw err;

    // Query the results
    model.find(function(err, photos){
      console.log('Updating %d photos.', photos.length);
      photos.forEach(function(photo){
        var userId = photo._id.split('/')[0];
        var photoId = photo._id.split('/')[1];

        var setter = {$set : {}};
        var interestingness = photo.value !== 50 ? photo.value : Math.floor(Math.random()*100);
        
        // TODO: move to individual updates per user
        setter.$set['copies.interestingness'] = interestingness;
        setter.$set['copies.calculated'] = new Date();

        Photo.update({_id : new ObjectId(photoId)}, setter, function(err, photo){
          if (err) console.log('error when updating interestingness:', err);
        });

      });

    });
  });


};