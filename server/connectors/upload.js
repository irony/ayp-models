var passport = require('passport');
var InputConnector = require('./inputConnector');
var importer = require('../../jobs/importer');
var formidable = require('formidable');
var util = require('util');
var async = require('async');
var Photo = require('../../models/photo');

var connector = new InputConnector();

/**
 * Parses and uploads the photo to S3 based on a request coming from a browser.
 * @param  {[type]}   req  [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
connector.handleRequest = function(req, done){
    console.debug('got upload request...');
  var form = new formidable.IncomingForm();
  var self = this;
  var i = 0;
  var photo = new Photo();

  form.on('field', function (field) {
    if (field.name === "exif")
      photo.exif = field.value;
  });

  form.onPart = function (part) {
    if (!part.filename) {
      return form.handlePart(part);
    }

/*    part.pause = function() {
      form.pause();
    };

    part.resume = function() {
      form.resume();
    };
*/
    var quality = part.name.split('|')[0];
    var taken = part.name.split('|')[1];
    part.length = part.name.split('|')[2]; // hack, should be set elsewhere?
    photo.source = 'upload';
    photo.bytes = part.length;
    photo.path = part.filename;

    if (taken){
      // convert 2012:04:01 11:12:13 to ordinary datetime
      photo.taken = taken.slice(0,10).split(':').join('-') + taken.slice(10);
    }

    console.log('%s taken:', quality, photo.taken);

    // photo.bytes = file.length;
    photo.mimeType = part.mime || 'image/jpeg';
    // console.debug('saving in database', photo);

    async.parallel({
      upload: function(next){
        console.debug('upload..');
        return self.upload(quality + "s", photo, part, next);
      },
      save : function(next){
        console.debug('save..');
        return importer.savePhotos(req.user, [photo], next);
      }
    }, function(err, result){
      console.log(result.save[0]);
      return done(result);
    });
  };

  form.on('error', done);

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
