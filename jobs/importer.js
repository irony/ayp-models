
var Photo = require('../models/photo');
var _ = require('underscore');
var async = require('async');


var importer = {


  savePhotos : function(user, photos, progress){

        async.map(photos, function(photo, next){

          Photo.findOne({'source' : photo.source, 'taken' : photo.client_mtime}, function(err, dbPhoto){

            if (err) {
              throw err;
            }

            if (!dbPhoto){
              dbPhoto = new Photo();
            }


            dbPhoto.set('owners', _.uniq(_.union([user._id], dbPhoto.owners)));

            dbPhoto.source = photo.source;
            dbPhoto.path = photo.path;
            dbPhoto.modified = photo.modified;
            dbPhoto.taken = photo.client_mtime;
            dbPhoto.interestingness = dbPhoto.interestingness || Math.random() * 100; // dummy value now. TODO: change to real one
            // dbPhoto.interestingness = dbPhoto.interestingness || 50;
            dbPhoto.metadata = photo;
            dbPhoto.bytes = photo.bytes;
            dbPhoto.mimeType = photo.mime_type;

            dbPhoto.save(function(err, savedPhoto){
              return progress(err, savedPhoto);
            });

          });
        }, function(err, savedPhotos){

          if (progress) progress(err, savedPhotos);

        });
  },

  downloadPhoto : function(user, photo, done){

    var connector = require('../connectors/' + photo.source);
    if (connector.downloadPhoto) {
      async.parallel({
        download : function(callback){
          connector.downloadPhoto(user, photo, callback);
        },
        thumbnail : function(callback){
          connector.downloadThumbnail(user, photo, callback);
        }
      }, function(err, results){
        done(err, results);
      });
    }

  },


  importPhotosFromAllConnectors : function(user, done){
    if (user.accounts){

      _.each(user.accounts, function(account, connectorName){
        console.log('Evaluating', connectorName);

        var connector = require('../connectors/' + connectorName);
        if (connector.downloadAllMetadata) {
            console.log('downloading metadata from', connectorName);

          connector.downloadAllMetadata(user, function(err, photos){
            if (err || !photos) return console.error(err);
            console.log('saving %d photos', photos.length);
            return importer.savePhotos(user, photos, done);

          });
        }
      });

    }

  }

}

module.exports = importer;