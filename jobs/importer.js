// Importer
// ====
// Helper methods for importing metadata for all active connectors

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
  savePhotos : function(user, photos, done){
        console.debug('Saving %d photos', photos.length);

        async.map(photos, function(photo, next){

          console.debug('Saving photo %s', photo.path);

          Photo.findOne({'bytes' : photo.bytes, 'taken' : photo.client_mtime || photo.taken}, function(err, dbPhoto){
              console.log('found %d photos', dbPhoto ? "one" : "no", err);


            if (err) {
              console.log('Error saving photo', err);
              return done(err);
            }

            if (!dbPhoto){
              dbPhoto = new Photo();
              dbPhoto.copies = {};
              // console.debug('Found no photo, creating new ');

            } else {
              // console.debug('Found photo, ', dbPhoto._id);
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

            // console.log('Updating photo, ', dbPhoto);


            dbPhoto.save(next);

          });
        }, done);
  },
  
  /**
   * Downloads and saves metadata for all connectors of the provided user
   * @param  {[type]}   user user
   * @param  {Function} done callback when done
   */
  importPhotosFromAllConnectors : function(user, done){
    if (user.accounts){
      
      _.each(user.accounts, function(account, connectorName){
        if (!connectorName) return done();

        var connector = require('../server/connectors/' + connectorName); //connectorName.replace(/^[a-z]/,''));
        if (connector.importNewPhotos) {
          connector.importNewPhotos(user, function(err, photos){
            if (err || !photos || !photos.length) return done && done(err);

            console.log('Importer: Found %d new photos', photos.length);
            return importer.savePhotos(user, photos, done);

          });
        }
      });

    }

  },

  importAllNewPhotos : function(done){
    if (!done) throw new Error("Callback is mandatory");
    User.find().where('accounts.dropbox').exists().exec(function(err, users){
      
      if (err || !users.length) done(err);

      async.mapSeries(users, function(user, done){
        importer.importPhotosFromAllConnectors(user, done);
      }, done);
    });
  },

};

module.exports = importer;