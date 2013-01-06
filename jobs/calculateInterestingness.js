var ObjectId = require('mongoose').Types.ObjectId,
    timeago = require('timeago'),
    Photo = require('../models/photo'),
    async = require('async'),
    mongoose = require('mongoose');



module.exports = function(){

  var map = function(){

    var self = this;

    if (this && this.owners){
      for(var user in this.owners){

        if(self.hidden) emit(user + "/" + self._id, {weight:100, value: 0});

        if(self.starred) emit(user + "/" + self._id, {weight:100, value: 1});
        if(self.views) emit(user + "/" + self._id, {weight:80, value: Math.min(1, 0.5 + self.views / 10)});
        
        if(self.clicks) emit(user + "/" + self._id, {weight:90, value: Math.min(1, 0.8 + self.clicks / 3)});

        if(self.tags.length) emit(user + "/" + self._id, {weight:70, value: Math.min(1, 0.5 + self.tags.length / 2)});
        if(self.groups && self.groups.length) emit(user + "/" + self._id, {weight:70, value: Math.min(1, 0.6 + self.groups.length / 2)});

      }
    }

  }; 

  var reduce = function(group, actions){

    var returnValue = 0;
    var returnWeight = 0;
    var count = 0;
    actions.forEach(function(action){
      returnValue += Math.min(100, action.value * (action.weight));
      returnWeight += action.weight;
      count++;
    });

    if (returnWeight === 0) return null;

    return {weight: Math.round(parseFloat(returnWeight / count)), value: Math.round(parseFloat(returnValue / count))};
  };

// add query to only reduce modified images
  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'interestingness'}}, function(err, model, stats){

    if (err) throw err;

    model.find(function(err, photos){
      photos.forEach(function(photo){

        Photo.update({_id : new ObjectId(photo._id.split('/')[1])}, {$set : {interestingness : photo.value.value, calculated : new Date()}}, function(err, photo){
          if (err) console.log('error when updating interestingness:', err);
        });

      });

    });
  });


};