var mongoose = require('mongoose');
var config = require('../conf');
var express = require('express');
var knox      = require('knox');
var async = require('async');
var http = require('http');
var User = require('../models/user');
var Photo = require('../models/photo');
var _ = require('underscore');
var colors = require('colors');

// Connect mongodb
var conn = mongoose.connect(config.mongoUrl);

// more logs
// require('longjohn');


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
  {
    title: 'Import new photos from all connectors',
    fn:function(done){
      require('../jobs/importer').downloadNewPhotos(done, {
        batchSize: 10,
        autoRestart : true
      });

    }, interval: 0}

];

// first run may be put in serial mode (MapSeries) which mean it will wait for the first job to be finished
// before the next job continues. Good for debugging.
//
// This setup requires all jobs to accept a callback as first parameter which should be fired when all job is done
//
async.map(jobs, function(job, done){
  console.log('Starting job: %s', job.title.white);

  // start the job and receive a callback when the job is finished.
  job.fn(function finished (err){
    console.log('Finished job: %s', job.title.white + ' [' + (err ? err.toString().red : 'OK'.green) + ']');
    return done(err);
  });

  if (job.interval) setInterval(job.fn, job.interval);
},
function(err){
  console.log('Done with initial jobs %s', err ? err.toString().red : 'without errors'.green);
});

http.globalAgent.maxSockets = 50;
global.s3 = knox.createClient(config.aws);

