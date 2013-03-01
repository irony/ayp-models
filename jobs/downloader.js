// Importer
// ====
// Helper methods for downloading metadata and photos for all active connectors

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

    var connector = require('../server/connectors/' + photo.source);
    if (connector.downloadOriginal && user.accounts[photo.source]) {
      async.parallel({
        original : function(done){
          //console.log('Downloading original...');
          connector.downloadOriginal(user, photo, function(err, result){
            return done(err, result);
          });
        },
        thumbnail : function(done){
          // console.log('Downloading thumbnail...');
          connector.downloadThumbnail(user, photo, function(err, result){
            return done(err, result);
          });
        }
      }, function(err, results){
    
        // console.log('Finished downloading photo', photo._id);

        return done(err, results);
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
  downloadNewPhotos : function(done, options){

    var photoQuery = Photo.find()
    .where('store.original.stored').exists(false)
    .sort('-modified')
    .limit(options && options.batchSize || 10);
    var downloadAllResults = function downloadAllResults(err, photos){
      // console.log('[50]Found %d photos without downloaded images. Downloading...', photos.length);

      async.map(photos, function(photo, done){
        User.find().where('_id').in(photo.owners).exec(function(err, users){
          
          if (!users || !users.length) {
            // console.log("Didn't find any user records for any of the user ids:", photo.owners);
            return photo.remove(done);
          }

          // We don't know which user this photo belongs to so we try to download them all
          users.map(function(user){
            downloader.downloadPhoto(user, photo, function(err, result){
              return done(err, photo); // ignore errors to continue
            });
          });
        });
      }, function(err, photos){
        
        console.log('Downloaded %d photos: %s', _.compact(photos).length, err && err.toString().red || 'Without errors'.green);
  
        if(options && options.autoRestart){
          setTimeout(function(){
            photoQuery.exec(downloadAllResults);
          }, 200);
        } else{
          return done(err, photos);
        }
        
      });
    };
    
    // first run
    photoQuery.exec(downloadAllResults);

  }

};

module.exports = downloader;