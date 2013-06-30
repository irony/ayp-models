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

if (!global.debug && false ){
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




var jobs = {
  importer :        [
                      startJob('Importer',
                      require('../jobs/importer').importAllNewPhotos)
                    ],

  cluster :         [
                      'importer',
                      startJob(
                        'Cluster',
                        require('../jobs/clusterPhotos')
                        // ,function(results){return !results.import || results.import.length === 0;}
                      )
                    ],

  thumbnails :      [
                      'importer',
                      startJob(
                        'Thumbnails',
                        require('../jobs/downloader').downloadThumbnails,
                        function(results){return !results.import || results.import.length === 0;}
                        )
                    ],

  originals :       [
                      'thumbnails',
                      startJob(
                        'Originals',
                        require('../jobs/downloader').downloadOriginals,
                        function(results){return !results.import || results.import.length === 0;}
                      )
                    ],

  /*interestingness : [
                      'importer', 'cluster',
                      startJob(
                        'Interestingness',
                        require('../jobs/calculateInterestingness',
                        function(results){return !results.cluster || results.cluster.length === 0;})
                      )
                    ],*/

  rank :            [
                      'cluster',
                      startJob(
                        'Rank',
                        require('../jobs/updateRank')
                        //,
                        //function(results){return !results.interestingness || results.interestingness.length === 0;}
                      )
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

/* wrapper to be able to log the progress */
function startJob (title, job, skip){


  function start(done, previousResults){
    console.log(previousResults);

    function finish(err, result){
      if (err) console.log('Job done err: %s', title + ' [' + (err ? err.toString().red : 'OK'.green) + ']', result && result.length || '');
      else console.debug('Finished job: %s affected: %s', title.white + ' [' + ('OK'.green) + ']', result && result.length || '');
      return done(err, result);
    }

    if (skip && skip(previousResults)) return done();

    console.debug('Starting job: %s', title.white);
    process.stdout.write(".");
    

    job(finish, previousResults);
  }

  return start;
}

try{
  async.auto(jobs, function(err, result){

    if (err) console.log('Sequence err: %s', ' [' + (err ? err.toString().red : 'OK'.green) + ']', result && result.length || '');
   
    // TODO: restart the jobs

  });
}
catch(err){
  console.log('Unhandled exception in job %s:', err.toString().red);
}

http.globalAgent.maxSockets = 50;
global.s3 = knox.createClient(config.aws);

