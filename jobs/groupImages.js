var ObjectId = require('mongoose').Types.ObjectId,
    timeago = require('timeago'),
    Photo = require('../models/photo'),
    async = require('async'),
    mongoose = require('mongoose');



module.exports = function(app){

  var map = function(){

    var self = this;
    this.owners.forEach(function(user){

      // Wed, 05 Dec 2012 20:25:10 GMT
      var datePart = new Date(self.taken).getDate();
      var yearPart = new Date(self.taken).getFullYear();
      var monthPart = new Date(self.taken).getMonth()+1;
      var hourPart = new Date(self.taken).getHours();
      var minutePart = new Date(self.taken).getMinutes();

      emit(user + "/" + yearPart + "/" + monthPart + "/" + datePart + "/" + hourPart + "/" + minutePart, self);
      emit(user + "/" + yearPart + "/" + monthPart + "/" + datePart + "/" + hourPart, self);
      emit(user + "/" + yearPart + "/" + monthPart + "/" + datePart, self);
      emit(user + "/" + yearPart + "/" + monthPart, self);
      emit(user + "/" + yearPart, self);
      
      if (monthPart < 3 || monthPart > 10)
        emit(user + "/" + yearPart + "/winter", self);

      if (monthPart >= 3 && monthPart < 6)
        emit(user + "/" + yearPart + "/spring", self);

      if (monthPart >= 9 && monthPart < 11)
        emit(user + "/" + yearPart + "/autumn", self);

      if (monthPart >= 5 && monthPart < 9)
        emit(user + "/" + yearPart + "/summer", self);


    });

  };

  var reduce = function(group, photos){

    return photos.sort(function(a,b){
      return b.interestingness - a.interestingness;
    })[0];

  };


  Photo.mapReduce({map:map, reduce:reduce, out : {replace : 'groups'}}, function(err, model, stats){
    console.log('Started reducing photos', model.toString());

    if (err) throw err;

    model.find(function(err, groups){
      console.log(groups);
    });
  });


};