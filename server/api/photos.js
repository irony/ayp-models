var Photo = require('../../models/photo');
var Group = require('../../models/group');
var User = require('../../models/user');
var InputConnector = require('../connectors/inputConnector');
var fs = require('fs');
var path = require('path');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('underscore');

module.exports = function(app){

  app.get('/api/photo/:id', function(req, res){
    Photo.findOne({_id:req.params.id, owners : req.user._id}, function(err, photo){
      if (err) return res.send('Error finding photo', 500);
      if (!photo) return res.send('Could not find photo', 403);
      photo.mine = photo.copies[req.user._id]; // only use this user's personal settings
      photo.vote = photo.mine.vote || (photo.mine.calculatedVote);

      res.json(photo);
    });
  });

  app.get('/api/photoFeed', function(req, res){
    if (!req.user){
      return res.send('Login first', 403);
    }

    var reverse = req.query.reverse === 'true',
        filter = (reverse) ? {$gte : req.query.startDate || new Date()} : {$lte : req.query.startDate || new Date()};

    console.log('searching photos:', req.query);

    Photo.find({'owners': req.user._id}, 'copies.' + req.user._id + ' ratio taken store mimeType src')
    .where('taken', filter)
    .where('copies.' + req.user._id + '.hidden').ne(true)
    .where('store.thumbnail.stored').exists()
    .where('copies.' + req.user._id + '.calculatedVote').lte(parseFloat(req.query.vote))
    .sort((reverse ? '':'-') + 'taken')
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 100)
    .exec(function(err, photos){
      if (err) throw err;

      if (!photos || !photos.length){
        return res.json(photos);
      }

      console.log('found %d photos', photos.length);
      photos = photos.reduce(function(a,b){
        var diffAverage = 0,
            last = a.length ? a[a.length-1] : null;

        if (last) {
          b.timeDiff = Math.abs(last.taken.getTime() - b.taken.getTime());
          b.diffTotal = (last.diffTotal || 0) + b.timeDiff;
          diffAverage = b.diffTotal / a.length;
        }

        // Allow at least one fourth of the photos in the group.
        // And then only add photos which similar time diff compared to the rest of the photos
        // This is to prevent "horungar" from being added to a group
        if (a.length <= photos.length / 4 || b.timeDiff < diffAverage * 1.5) a.push(b);

        return a;
      }, []);

      async.map((photos || []), function(photo, done){
        photo.mine = photo.copies[req.user._id]; // only use this user's personal settings
        var vote = photo.mine.vote || (photo.mine.calculatedVote);
        /*
        if (res.push){
          // SPDY is supported
          photo.src = '/thumbnail/' + photo.source + '/' + photo._id;
          global.s3.get(photo.src).on('response', function(_res){
            res.push(photo.src,{}, function(pushStream){
              _res.pipe(pushStream);
            });
          }).end();
        }*/

        return done(null, {id: photo._id, tags: photo.mine.tags, taken: photo.taken, mimeType: photo.mimeType, src:photo.src, vote: Math.floor(vote), ratio: photo.ratio});

      }, function(err, photos){
        return res.json(photos);
      });
    });
  });

  app.post('/api/upload', function(req, res, next){
    if (!req.user){
      return res.send('Login first', 403);
    }

    var uploadConnector = require('../connectors/upload.js');
    uploadConnector.handleRequest(req, function(err, results, next){
      if (err) {
        console.log('Error: upload aborted: '.red, err);
        res.status(500).json(err.toString());
        return res.end();
      }
      try{
        res.json(results);
      } catch (err){
        console.log('Error: Could not send response: '.red, err);
        res.end();
      }
    });
    
  });

  app.post('/api/photoRange', function(req, res){

    var startDate = req.body.dateRange.split(' - ')[0],
    stopDate = req.body.dateRange.split(' - ')[1];

    if (!req.user){
      res.writeHead(403);
      return res.json({error:'Login first'});
    }
    

    if (!req.body.dateRange){
      res.writeHead(500);
      return res.json("No daterange");
    }

    Photo.find({'owners': req.user._id})
    .limit(500)
    .where('taken').gte(startDate).lte(stopDate)
    .sort('-taken')
    .exec(function(err, photos){

      async.map((photos || []), function(photo, done){
        photo.metadata = null;
        photo.src = photo.store && photo.store.thumbnail && photo.store.thumbnail.url || '/img/thumbnail/' + photo.source + '/' + photo._id;
        return done(null, photo);
      }, function(err, photos){
        return res.json(photos);
      });


    });
  });

  app.get('/api/library', function(req, res){
    console.log('loading library');
    var limit = req.query.limit || 2000;
    var baseUrl = 'https://allyourphotos-eu.s3.amazonaws.com/thumbnail';

    if (!req.user) return res.send('Login first');

    console.log('user', typeof(req.user._id));

    async.parallel({
      total : function(done){
        console.log('found total');
        Photo.find({'owners': req.user._id}).count(done);
      },
      modified: function  (done) {
        Photo.findOne({'owners': req.user._id}, 'modified')
          .sort({'modified': -1})
          .exec(function(err, photo){
            done(err, photo && photo.modified);
          });
      },
      photos : function(done){

        // return all photos with just bare minimum information for local caching
        Photo.find({'owners': req.user._id}, 'copies.' + req.user._id + ' taken source ratio store mimeType')
    //      .sort('-copies.' + req.user._id + '.interestingness')
        .where('taken').lt(req.query.taken || new Date())
        .where('modified').gt(req.query.modified || new Date(1900,0,1))
        .where('store.thumbnail').exists()
        .sort(req.query.modified ? {'modified' : 1} : {'taken' : -1})
        .skip(req.query.skip)
        .limit(parseInt(limit,10) +  1)
        .exec(function(err, photos){
          console.log('result', err || photos && photos.length);

          async.map((photos || []), function(photo, next){
            var mine = photo.copies[req.user._id] || {};
            var vote = mine.vote || (mine.calculatedVote);
            return next(null, {
              _id : photo._id,
              taken:photo.taken && photo.taken.getTime(),
              src: global.s3.signedUrl(
                  '/thumbnail/' + photo.source + '/' + photo._id
                , new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ) || null,
              vote: Math.floor(vote),
              ratio: photo.ratio
            });

          }, done);
        });
      }
    }, function(err, results){
        var next = results.photos.length > limit && results.photos.pop()[req.query.modified ? 'modified' : 'taken'] || null;
        results.next = next; //(results.photos.length === limit) && last.taken || null;
        results.baseUrl = baseUrl;
        res.json(results);
    });
  });

  app.get('/api/stats', function(req, res){

    if (!req.user) return res.send('Login first', null, 403);

    async.parallel({
      all: function  (done) {
        Photo.find({'owners': req.user._id})
          .count(done);
      },
      copies: function  (done) {
        Photo.find()
          .where('copies.' + req.user._id).exists(true)
          .count(done);
      },
      originals: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('store.original.stored').exists(true)
          .count(done);
      },
      thumbnails: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('store.thumbnail.stored').exists(true)
          .count(done);
      },
      queuedThumbnails : function(done){
        Photo.find()
        .where('store.thumbnail.stored').exists(false)
        // .where('store.lastTry').gte(new Date() - 24 * 60 * 60 * 1000) // skip photos with previous download problems
        .where('store.error').exists(false) // skip photos with previous download problems
        .count(done);
      },
      errors: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('store.error').exists(true)
          .count(done);
      },
      exif: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('exif').exists(true)
          .count(done);
      },
      interesting: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('copies.' + req.user._id + '.interestingness').gte(100)
          .count(done);
      },
      dropbox: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('source').equals('dropbox')
          .count(done);
      },
      manual: function  (done) {
        Photo.find({'owners': req.user._id})
          .where('source').equals('manual')
          .count(done);
      },
      modified: function  (done) {
        Photo.findOne({'owners': req.user._id}, 'modified')
          .sort({'modified': -1})
          .exec(function(err, photo){
            done(err, photo && photo.modified);
          });
      }

    }, function (err, result) {
      return res.json(result);
    });

    


  });


};