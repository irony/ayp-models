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
  downloadPhoto : function(user, photo, done){

    if (typeof(done) !== "function") throw new Error("Callback is mandatory" + JSON.stringify(done));
    if (!photo.source || !photo.source.length) done('No source connector found');

    var connector = require('../server/connectors/' + photo.source);
    if (connector.downloadOriginal && user.accounts[photo.source]) {
      async.parallel({
        original : function(done){
          //console.log('Downloading original...');
          connector.downloadOriginal(user, photo, done);
        },
        thumbnail : function(done){
          // console.log('Downloading thumbnail...');
          connector.downloadThumbnail(user, photo, done);
        }
      }, function(result){
        done(null, result);
      });
    }

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
    .where('store.error').exists(false)
    .sort('-taken')
    .limit(10);
    var downloadAllResults = function downloadAllResults(err, photos){
      // console.log('[50]Found %d photos without downloaded images. Downloading...', photos.length);

      async.map(photos, function(photo, done){
        User.find().where('_id').in(photo.owners).exec(function(err, users){
          
          if (!users || !users.length) {
            // console.log("Didn't find any user records for any of the user ids:", photo.owners);
            return photo.remove(done);
          }

          // We don't know which user this photo belongs to so we try to download them all
          async.map(users, function(user, done){
            downloader.downloadPhoto(user, photo, function(err){
              if (err) {
                photo.store = photo.store || {};
                photo.store.error = {type:'Download error', details: JSON.stringify(err), action: 'skip', date: new Date()};
                photo.markModified('store');
                return photo.save(function(err){
                  return done(null, photo);
                });
              }

              return done(null, photo);
            });
          }, done);
        });
      }, function(err, photos){
        
        // console.log('Downloaded %d photos: %s', _.compact(photos).length, err && err.toString().red || 'Without errors'.green);
        return done(err, photos);

      });
    };
    
    // first run
    photoQuery.exec(downloadAllResults);

  }

};

module.exports = downloader;