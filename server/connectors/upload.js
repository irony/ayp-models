var passport = require('passport');
var InputConnector = require('./inputConnector');
var importer = require('../../jobs/importer');
var multiparty = require('multiparty');
var util = require('util');
var async = require('async');
var Photo = require('../../models/photo');
var Batch = require('batch');
var _ = require('underscore');

var connector = new InputConnector();

/**
 * Parses and uploads the photo to S3 based on a request coming from a browser.
 * @param  {[type]}   req  [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
connector.handleRequest = function(req, done){
  var form = new multiparty.Form();
  var self = this;
  var i = 0;
  var photo = new Photo();
  var parts = 0;

  form.on('field', function (field) {
    if (field.name === "exif")
      photo.exif = field.value;
  });

  form.on('part', function (part) {
    if (!part.filename) {
      return;
    }
    // console.log('part name', part.name);
    var quality = part.name.split('|')[0];
    var taken = part.name.split('|')[1];
    part.length = part.name.split('|')[2]; // hack, should be set elsewhere?
    photo.source = 'upload';
    photo.bytes = part.length;
    photo.path = part.filename;
    photo.modified = new Date();
    photo.owners = [req.user._id];
    photo.store = {};
    
    parts++; // keep track on how many parts we have to handle

    if (taken){
      // convert 2012:04:01 11:12:13 to ordinary datetime
      photo.taken = new Date(taken.slice(0,10).split(':').join('-') + taken.slice(10));
    } else {
      // photo.taken = photo.modified;
    }

    // photo.bytes = file.length;
    photo.mimeType = part.mimeType || 'image/jpeg';
    self.upload(quality + "s", photo, part, function(err, uploadedPhoto){
      photo.store = _.extend(photo.store, uploadedPhoto.store);
      photo.markModified('store');
      if (uploadedPhoto.exif){
        photo.exif = uploadedPhoto.exif;
        photo.markModified('exif');
        photo.markModified('ratio');
      }

      parts--;
      if (parts === 0){
        importer.findOrInitPhoto(req.user, photo, function(err, importedPhoto){
          if (err) return done(err);
          importedPhoto.save(done);
        });
      }

    });

    /*importer.savePhotos(req.user, [photo], function(err, photos){
      console.log('save');
    });*/
  });

  form.on('error', done);
  //form.on('end', function(){done});
  //
  form.parse(req);
};

connector.downloadThumbnail = function(user, photo, done){
  throw new Error('Not implemented');
};

connector.downloadOriginal = function(user, photo, done){
  throw new Error('Not implemented');
};

connector.importNewPhotos = function(user, progress){
  throw new Error('Not implemented');
};

connector.getClient = function(user){
  throw new Error('Not implemented');
};

module.exports = connector;
