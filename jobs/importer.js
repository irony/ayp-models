// Importer
// ====
// Helper methods for downloading metadata and photos for all active connectors

var Photo = require('../models/photo');
var PhotoCopy = require('../models/photoCopy');
var User = require('../models/user');
var _ = require('underscore');
var async = require('async');


var importer = {

  /**
   * Save an array of photos fetched elsewhere to the database
   * @param  {[type]} user     a mongoose user model
   * @param  {[type]} photos   array of photos
   * @param  {[type]} progress callback which will be called after save of whole collection with (err, photos)
   */
  savePhotos : function(user, photos, progress){

        async.map(photos, function(photo, next){

          Photo.findOne({'source' : photo.source, 'taken' : photo.client_mtime}, function(err, dbPhoto){

            if (err) {
              throw err;
            }

            if (!dbPhoto){
              dbPhoto = new Photo();
              dbPhoto.copies = {};
            }


            dbPhoto.set('owners', _.uniq(_.union([user._id], dbPhoto.owners)));

            var photoCopy = dbPhoto.copies[user._id];

            if (!photoCopy)
              dbPhoto.copies[user._id] = photoCopy = new PhotoCopy();

            photoCopy.interestingness = photoCopy.interestingness || Math.random() * 100; // dummy value now. TODO: change to real one
            dbPhoto.markModified('copies');

            dbPhoto.source = photo.source;
            dbPhoto.path = photo.path;
            dbPhoto.modified = photo.modified;
            dbPhoto.taken = photo.client_mtime;
            // dbPhoto.interestingness = dbPhoto.interestingness || 50;
            dbPhoto.metadata = photo;
            dbPhoto.bytes = photo.bytes;
            dbPhoto.mimeType = photo.mime_type;

            dbPhoto.save(function(err, savedPhoto){
              if (progress) progress(err, savedPhoto);
            });

          });
        }, function(err, savedPhotos){

          if (progress) progress(err, savedPhotos);

        });
  },
  
  /**
   * download both original and thumbnail of photo from photos connector
   * @param  {[type]}   user  user
   * @param  {[type]}   photo photo
   * @param  {Function} done  callback when both are done
   */
  downloadOriginal : function(user, photo, done){

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
   * Downloads and saves metadata for all connectors of the provided user
   * @param  {[type]}   user user
   * @param  {Function} done callback when done
   */
  importPhotosFromAllConnectors : function(user, done){
    if (user.accounts){
      
      _.each(user.accounts, function(account, connectorName){
        var connector = require('../connectors/' + connectorName);
        if (connector.downloadAllMetadata) {
          connector.downloadAllMetadata(user, function(err, photos){
            if (err || !photos) return console.error(err);
            if (photos.length === 0) return;

            console.log('found %d new photos', photos.length);
            return importer.savePhotos(user, photos, done);

          });
        }
      });

    }

  },
  fetchNewMetadata : function(){
    User.find().where('accounts.dropbox').exists().exec(function(err, users){
      _.uniq(users, false, function(a){return a._id}).map(function(user){
        importer.importPhotosFromAllConnectors(user);
      });
    });
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
            importer.downloadOriginal(user, photo, function(err, result){
              return done(err, photo); // ignore errors to continue
            });
          });
        });
      }, function(err, photos){
        
        console.log('Imported %d photos: %s', _.compact(photos).length, err && err.toString().red || 'Without errors'.green);
  
        if(options && options.autoRestart){
          process.nextTick(function(){
            photoQuery.exec(downloadAllResults);
          });
        } else{
          return done(err, photos);
        }
        
      });
    };
    
    // first run
    photoQuery.exec(downloadAllResults);

  }

};

module.exports = importer;