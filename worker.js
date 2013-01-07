var mongoose = require('mongoose');
var conn = mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/allmyphotos');
var express = require('express');
var config = require('./conf');
var knox      = require('knox');
var amazon_url = 'http://s3.amazonaws.com/' + config.aws.bucket;
var async = require('async');
var http = require('http');
var Photo = require('./models/photo');
var importer = require('./jobs/importer');
var _ = require('underscore');

var photoQuery = Photo.find().where('store.thumbnails.stored').exists(false).populate('owners').sort('-modified').limit(50);

var queryParser = function queryParser(err, photos){
  async.map(function(photo, done){
    queryParser.parsing = true;
    _.uniq(photo.owners, function(a){return a._id}).forEach(function(user){
      importer.downloadPhoto(user, photo, function(err, result){
        console.log('.');
        done(err);
      });
    });

  }, function(err){
    queryParser.parsing = false;
    console.log('finished with batch', err);
    photoQuery.exec(queryParser);
  });
};


var jobs = [
  require('./jobs/groupImages'),
  require('./jobs/calculateInterestingness'),
  require('./jobs/tagPhotos'),
  function(){
    
    if (!queryParser.parsing) // we don't want to intrude in the parsing process
      photoQuery.exec(queryParser);
  }
];

setInterval(function(){

  async.parallel(jobs);

}, 10000);


http.globalAgent.maxSockets = Infinity;
global.s3 = knox.createClient(config.aws);

