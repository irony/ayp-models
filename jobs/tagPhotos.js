var ObjectId = require('mongoose').Types.ObjectId,
    Photo = require('../models/photo'),
    async = require('async'),
    mongoose = require('mongoose'),
    emit = {};



module.exports = function(done){

  var map = function(){

    var parts = (this.path || '').split('/');
    parts.pop(); // remove filename
    parts.splice(1,1); // remove /photos or main catalog, it's not that interesting
    if (parts.length)
    {
      var self = this;
        parts.forEach(function(tag){
          if (tag.trim()){
            self.owners.map(function(user){
              emit({photoId : self._id, userId : user}, tag.trim().split('_').join(' '));
            });

          }
        });
    }
  };

  var reduce = function(key, tags){

    return tags.join(',');

  };

  console.log('Starting map/reduce tags...');

  // add query to only reduce modified images
  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'tags'}, verbose:true}, function(err, model, stats){
  

    if (err) throw err;

    model.find(function(err, photos){
      async.forEach(photos, function(photo, done){
        var photoSet = {copies : {}};
        var key = photo._id;
        photoSet.copies[key.userId] = {tags : photo.value};
        Photo.findOneAndUpdate({_id : key.photoId}, photoSet, {safe:true}, done);
      }, function(err, updated){
        if (done) return done(err, updated);
      });

    });
  });


};