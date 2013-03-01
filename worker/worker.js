var mongoose = require('../node_modules/mongoose');
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
    title:'Import New Photos',
    fn:require('../jobs/importer').importAllNewPhotos,
    interval: 1 * 60 * 1000
  },
  {
    title: 'Download new photos',
    fn:require('../jobs/downloader').downloadNewPhotos,
    interval: 10 // download as fast as possible
  },
  {
    title:'Group Photos',
    fn:require('../jobs/groupImages'),
    interval: 9 * 60 * 1000
  },
  {
    title:'Tag Photos',
    fn:require('../jobs/tagPhotos'),
    interval: 9 * 60 * 1000
  },
  {
    title:'Calculate Interestingness',
    fn:require('../jobs/calculateInterestingness'),
    interval: 10 * 60 * 1000
  },
  {
    title:'Update Rank for all Photos',
    fn:require('../jobs/updateRank'),
    interval: 1 * 60 * 1000 // TODO: only update affected photos / pub/sub
  }

];

/* Start a job and keep it running */
function startJob (job, done){

  function start(){
    console.log('Starting job: %s', job.title.white);
  }

  function finish(err, result){
    console.log('Finished job: %s', job.title.white + ' [' + (err ? err.toString().red : 'OK'.green) + ']', result && result.length || '');
  }

  start(
    job.fn(function(err, result){

      finish(err,result);
      
      // Restart the job recursivly after it is finished (after a specified interval).
      // This means that two incarnations of the same job can not run at the same time
      setTimeout(function() {
          startJob(job, finish);
      }, job.interval);

    })
  );
}


// first run may be put in serial mode (just add .mapSeries) which mean it will wait for the first job to be finished
// before the next job continues. Good for debugging.
//
// This setup requires all jobs to accept a callback as first parameter which should be fired when all job is done
async.map(jobs, startJob);

// http.globalAgent.maxSockets = 50;
global.s3 = knox.createClient(config.aws);

