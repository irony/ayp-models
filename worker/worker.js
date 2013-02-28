var mongoose = require('mongoose');
var config = require('../conf');

// var conn = mongoose.connect(process.env['MONGOHQ_URL'] || 'mongodb://localhost/allmyphotos');
mongoose.connect(config.mongoUrl);

mongoose.connection.on('error', function(err){
  console.log('Connection error:', err);
});


var express = require('express');
var knox      = require('knox');
var amazon_url = 'http://s3.amazonaws.com/' + config.aws.bucket;
var async = require('async');
var http = require('http');
var User = require('../models/user');
var Photo = require('../models/photo');
var importer = require('../jobs/importer');
var _ = require('underscore');

// more logs
// require('longjohn');

// define some nasty colors for console.
var red, blue, reset;
red   = '\033[31m';
blue  = '\033[34m';
reset = '\033[0m';


var jobs = [
  {
    title:'Group images',
    fn:require('../jobs/groupImages'),
    interval: 9 * 60 * 1000},
  {
    title:'Tag Photos',
    fn:require('../jobs/tagPhotos'),
    interval: 9 * 60 * 1000},
  {
    title:'Calculate Interestingness',
    fn:require('../jobs/calculateInterestingness'),
    interval: 10 * 60 * 1000},
  {
    title:'Update rank for all photos',
    fn:require('../jobs/updateRank'),
    interval: 15 * 60 * 1000},
  /*,{fn:function(){require('./jobs/importer').fetchNewPhotos({
      limit: 10,
      autoRestart : true
    })}, interval: 0}*/

];

// first run once in serial mode == wait for the first job to be finished before the next job continues.
// This requires all jobs to accept a callback as first parameter)
async.mapSeries(jobs, function(job, done){
  console.log('Starting %s', job.title);
  job.fn(function(err){
    if (!err) console.log('[' + blue + 'OK' + reset + ']');
    return done(err);
  });

  if (job.interval) setInterval(job.fn, job.interval);
},
function(err){
  console.log('Done with initial jobs %s', (err ? red : blue) + (err || 'without errors') + reset);
});

http.globalAgent.maxSockets = 50;
global.s3 = knox.createClient(config.aws);

