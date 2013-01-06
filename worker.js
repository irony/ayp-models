var mongoose = require('mongoose');
var conn = mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/allmyphotos');
var express = require('express');
var config = require('./conf');
var knox      = require('knox');
var amazon_url = 'http://s3.amazonaws.com/' + config.aws.bucket;
var async = require('async');

var jobs = [
  require('./jobs/groupImages'),
  require('./jobs/calculateInterestingness'),
  require('./jobs/tagPhotos')
];

setInterval(function(){

  async.parallel(jobs);

}, 10000);
