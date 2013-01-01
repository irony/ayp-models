var ObjectId = require('mongoose').Types.ObjectId,
    timeago = require('timeago'),
    Photo = require('../models/photo'),
    async = require('async'),
    mongoose = require('mongoose'),
    emit = {};



module.exports = function(app){

  var map = function(){

    var parts = (this.path || '').split('/');
    parts.pop(); // remove filename
    if (parts.length)
    {
      var self = this;
        parts.forEach(function(tag){
          if (tag.trim())
            emit(self._id, tag.trim());
        });
    }
  };

  var reduce = function(photoId, tags){

    return tags.join(',');

  };

  // add query to only reduce modified images
  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'tags'}}, function(err, model, stats){
    console.log('Started reducing photos', err);

    if (err) throw err;

    model.find(function(err, photos){
      photos.forEach(function(photo){

        Photo.update({_id : photo._id}, {$set : {tags : (photo.value || '').split(',')}}, function(err, photo){
          if (err) return console.log('error when updating tags:', err);
        });
      });

    });
  });


};