var config = require('../conf');

//require('nodetime').profile(config.nodetime);

var app = require('../server/app');
var express = require('express');
var knox      = require('knox');
var async = require('async');
var http = require('http');
var User = require('../models/user');
var Photo = require('../models/photo');
var _ = require('lodash');
var colors = require('colors');


if ((process.env.NODE_ENV || 'development') !== 'development'){
  console.debug = function(){ /* ignore debug messages*/};
} else{
  // more logs
   //require('longjohn');
    console.debug = console.log;

  /*require('nodetime').profile({
    accountKey: 'a3163d6d8e01eee439e7c772f8fa6fad851aa1a5',
    appName: 'All Your Photos Worker'
  });*/
}




/* wrapper to be able to log the progress */
function startJob(options){


  function start(done, previousResults){
    // console.log(previousResults);

    function finish(err, result){
      if (err) console.log('Job done err: %s', options.title + ' [' + (err ? err.toString().red : 'OK'.green) + ']', result && result.length || '');
      else console.debug('Finished job: %s affected: %s', options.title.white + ' [' + ('OK'.green) + ']', result && result.length || '');
      
      process.stdout.write(".".green);
      return done(err, result);
    }

    if (options.skip && options.skip(previousResults)) return done();

    console.debug('Starting job: %s', options.title.white);
    process.stdout.write(".".white);
    
    // call job
    options.job(finish, previousResults);
  }

  return start;
}




var jobs = {
  importer :
  [
    startJob({
      title: 'Importer',
      job: require('../jobs/importer').importAllNewPhotos
    })
  ],

  cluster :
  [
    // dependencies
    'importer',
    startJob({
      title: 'Cluster',
      job: require('../jobs/clusterPhotos'),
      skip : function(results){return !results.importer || results.importer.length === 0;}
    })
  ],

  thumbnails :
  [
    // dependencies
    'importer',
    startJob({
      title: 'Thumbnails',
      job: require('../jobs/downloader').downloadThumbnails,
      skip: function(results){return !results.importer || results.importer.length === 0;}
    })
  ],

  originals :
  [
    // dependencies
    'thumbnails',
    startJob({
      title: 'Originals',
      job: require('../jobs/downloader').downloadOriginals,
      skip: function(results){return !results.importer || results.importer.length === 0;}
    })
  ],

  /*interestingness :
  [
    'importer', 'cluster',
    startJob({
      title: 'Interestingness',
      job: require('../jobs/calculateInterestingness',
      skip: function(results){return !results.cluster || results.cluster.length === 0;})
    })
  ],*/

  rank :
  [
    // dependencies
    'cluster',
    startJob({
      title: 'Rank',
      job: require('../jobs/updateRank')
      ,
      skip: function(results){return !results.cluster || results.cluster.length === 0;}
    })
  ]

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
};

function restart()
{
  try{
    
    console.debug('Start sequence...');
    async.auto(jobs, function(err, result){

      if (err) console.log('Sequence err: %s', ' [' + (err ? err.toString().red : 'OK'.green) + ']', result && result.length || '');
     
      process.stdout.write(".".yellow);
      console.debug('Restart sequence...');
      setTimeout(restart, 15000);

    });
  }
  catch(err){
    console.log('Unhandled exception in job %s:', err.toString().red);
  }
}

restart();


http.globalAgent.maxSockets = 50;
global.s3 = knox.createClient(config.aws);

