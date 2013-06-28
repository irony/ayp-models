var config = require('../conf');

// require('nodetime').profile(config.nodetime);

var app = require('../server/app');
var express = require('express');
var knox      = require('knox');
var async = require('async');
var http = require('http');
var User = require('../models/user');
var Photo = require('../models/photo');
var _ = require('lodash');
var colors = require('colors');

if (!global.debug ){
  console.debug = function(){ /* ignore debug messages*/};
} else{
  // more logs
    require('longjohn');
    console.debug = console.log;

  require('nodetime').profile({
    accountKey: 'a3163d6d8e01eee439e7c772f8fa6fad851aa1a5',
    appName: 'All Your Photos Worker'
  });
}


var jobs = [
  {
    title:'Import New Photos',
    fn:require('../jobs/importer').importAllNewPhotos,
    interval: 1 * 60 * 1000
  },
  {
    title: 'Download new thumbnails',
    fn:require('../jobs/downloader').downloadThumbnails,
    interval: 10 // download as fast as possible
  },
  {
    title: 'Download new photos',
    fn:require('../jobs/downloader').downloadOriginals,
    interval: 2000 // prioritize thumbnails
  },
  /*{
    title:'Group Photos',
    fn:require('../jobs/groupImages'),
    interval: 9 * 60 * 1000
  },
  {
    title:'Tag Photos',
    fn:require('../jobs/tagPhotos'),
    interval: 9 * 60 * 1000
  },*/
  {
    title:'Cluster',
    fn:require('../jobs/clusterPhotos'),
    interval: 10 * 60 * 10000
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
    console.debug('Starting job: %s', job.title.white);
    process.stdout.write(".");
  }

  function finish(err, result){
    if (err) console.log('Job done err: %s', job.title.white + ' [' + (err ? err.toString().red : 'OK'.green) + ']', result && result.length || '');
    else console.debug('Finished job: %s affected: %s', job.title.white + ' [' + ('OK'.green) + ']', result && result.length || '');
  }

  try{
    start(job.fn(function(err, result){

      finish(err,result);
      
      // Restart the job recursivly after it is finished (after a specified interval).
      // This means that two incarnations of the same job can not run at the same time
      setTimeout(function() {
          process.nextTick(function(){
            startJob(job, finish);
          });
      }, job.interval);

    }));
  }
  catch(err){
    console.log('Unhandled exception in job %s:', job.title.white, err.toString().red);
  }

}


// first run may be put in serial mode (just add .mapSeries) which mean it will wait for the first job to be finished
// before the next job continues. Good for debugging.
//
// This setup requires all jobs to accept a callback as first parameter which should be fired when all job is done
async.map(jobs, startJob);

http.globalAgent.maxSockets = 50;
global.s3 = knox.createClient(config.aws);

