// Importer
// ====
// Helper methods for downloading all photos for all active connectors

var Photo = require('../models/photo');
var PhotoCopy = require('../models/photoCopy');
var User = require('../models/user');
var _ = require('underscore');
var async = require('async');


var downloader = {
  
  /**
   * download both original and thumbnail of photo from photos connector
   * @param  {[type]}   user  user
   * @param  {[type]}   photo photo
   * @param  {Function} done  callback when both are done
   */
  downloadPhoto : function(user, photo, options, done){

    if (typeof(done) !== "function") throw new Error("Callback is mandatory" + JSON.stringify(done));
    if (!photo.source || !photo.source.length) return done('No source connector found');
    if (!options || (!options.thumbnail && !options.original)) return done('No downloader defined in options');

    var connector = require('../server/connectors/' + photo.source);
    if (connector.downloadOriginal && user.accounts[photo.source]) {
      
      console.debug('Downloading original and thumbnails from %s', photo.source);
      async.parallel({
        original : function(done){
          if (options.original && !photo.store || !photo.store.originals || !photo.store.originals.stored) {
            return connector.downloadOriginal(user, photo, function(err, result){
              console.debug('Done original');
              done(err, result);
            });
          }
          return done();

        },
        thumbnail : function(done){
          if (options.thumbnail && !photo.store || !photo.store.thumbnails || !photo.store.thumbnails.stored) {
            return connector.downloadThumbnail(user, photo, function(err, result){
              console.debug('Done thumbnail');
              done(err, result);
            });
          }
          return done();
        }
      }, function(result){
        console.debug('Done both', result);
        done(null, result);
      });
    }

  },

/**
   * Download all new thumbnails photos for a user
   * @param  {[User]} user
   * @param  {Callback} done
   */
  downloadThumbnails : function(user, done){
    if (!done) throw new Error("Callback is mandatory");

    var photoQuery = Photo.find({'owners': user._id}, 'store updated src taken')
    //.where('store.thumbnails.stored').exists(false)
    // .where('store.error').exists(false) // skip photos with previous download problems
    .sort('-taken');

    var downloadAllResults = function downloadAllResults(err, photos){
      console.log('[50]Found %d photos without downloaded images. Downloading...', photos && photos.length, err);
      
      async.mapSeries(photos, function(photo, done){
        photo.store.thumbnails = null;  // force new thumbnail to be downloaded
        downloader.downloadPhoto(user, photo, {thumbnail : true}, function(err){
          console.debug('Download photo done: ', photo.store);
          if (err) {
            photo.store = photo.store || {};
            photo.store.error = {type:'Download error', details: JSON.stringify(err), action: 'skip', date: new Date()};
            photo.markModified('store');
            return photo.save(function(){
              return done(null, photo); // we have handled the error, we don't want to abort the operation
            });
          }

          return done(null, photo);
        });
      }, function(err, photos){
        
        console.debug('Downloaded %d photos: %s', _.compact(photos).length, err && err.toString().red || 'Without errors'.green);
        return done(err, photos);

      });
    };
    
    // first run
    photoQuery.exec(downloadAllResults);

  },

  /**
   * Dpwnload photos for all newly downloaded metadata where the photos haven't been downloaded yet
   * @param  {[type]} options {
   *                             batchSize : 10 // how many should be downloaded in each batch?
   *                             autorestart : true // should this method be automatically restarted when all photos have been downloaded?
   *                          }
   */
  downloadNewPhotos : function(done){
    if (!done) throw new Error("Callback is mandatory");

    var photoQuery = Photo.find()
    .where('store.originals.stored').exists(false)
    .where('store.error').exists(false) // skip photos with previous download problems
    .sort('mimeType -taken') // images before videos
    .limit(3);

    var downloadAllResults = function downloadAllResults(err, photos){
      // console.log('[50]Found %d photos without downloaded images. Downloading...', photos.length);

      async.mapSeries(photos, function(photo, done){
        User.find().where('_id').in(photo.owners).exec(function(err, users){
          
          if (!users || !users.length) {
            // console.log("Didn't find any user records for any of the user ids:", photo.owners);
            return photo.remove(done);
          }

          // We don't know which user this photo belongs to so we try to download them all
          async.map(users, function(user, done){
            downloader.downloadPhoto(user, photo,  {original: true, thumbnail : true}, function(err){
                console.debug('Download photo done: ', photo.store);
              if (err) {
                

                photo.store = photo.store || {};
                photo.store.error = {type:'Download error', details: JSON.stringify(err), action: 'skip', date: new Date()};
                photo.markModified('store');
                return photo.save(function(){
                  return done(null, photo);  // We have handled the error, let's not abort the rest of the operation
                });
              }

              return done(null, photo);
            });
          }, done);
        });
      }, function(err, photos){
        
        console.debug('Downloaded %d photos: %s', _.compact(photos).length, err && err.toString().red || 'Without errors'.green);
        return done(err, photos);

      });
    };
    
    // first run
    photoQuery.exec(downloadAllResults);

  }

};

module.exports = downloader;