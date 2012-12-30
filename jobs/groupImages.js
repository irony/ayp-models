var ObjectId = require('mongoose').Types.ObjectId,
    timeago = require('timeago'),
    Photo = require('../models/photo'),
    async = require('async'),
    mongoose = require('mongoose'),
    emit = {};



module.exports = function(app){

  var map = function(){

    var self = this;
      // Wed, 05 Dec 2012 20:25:10 GMT
      var datePart = new Date(self.taken).getDate(),
          yearPart = new Date(self.taken).getFullYear(),
          monthPart = new Date(self.taken).getMonth()+1,
          hourPart = new Date(self.taken).getHours(),
          minutePart = new Date(self.taken).getMinutes();

      emit(yearPart + "/" + monthPart + "/" + datePart + "/" + hourPart, self);
      emit(yearPart + "/" + monthPart + "/" + datePart, self);
      emit(yearPart + "/" + monthPart, self);
      emit(yearPart, self);
      
      if (monthPart < 3 || monthPart > 10)
        emit(yearPart + "/winter", self);

      if (monthPart >= 3 && monthPart < 6)
        emit(yearPart + "/spring", self);

      if (monthPart >= 9 && monthPart < 11)
        emit(yearPart + "/autumn", self);

      if (monthPart >= 5 && monthPart < 9)
        emit(yearPart + "/summer", self);


  };

  var reduce = function(group, photos){

    return photos.sort(function(a,b){
      return b.interestingness - a.interestingness;
    })[0];

  };

  // add query to only reduce modified images
  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'groups'}}, function(err, model, stats){
    console.log('Started reducing photos', model.toString());

    if (err) throw err;

    model.find(function(err, groups){
      groups.forEach(function(group){
        Photo.update({_id : group.value._id}, {$set : {groups : group._id.toString().split('/')}}, function(err, photo){
          if (err) console.log('error when updating groups:', err);
        });

      });
    });
  });


};