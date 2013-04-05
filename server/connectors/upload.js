var passport = require('passport');
var InputConnector = require('./inputConnector');
var importer = require('../../jobs/importer');
var formidable = require('formidable');

var connector = new InputConnector();

/**
 * Parses and uploads the photo to S3 based on a request coming from a browser. 
 * @param  {[type]}   req  [description]
 * @param  {Function} done [description]
 * @return {[type]}        [description]
 */
connector.handleRequest = function(req, done){

  var form = new formidable.IncomingForm();
  var self = this;
  // Handle each part of the multi-part post
  form.onPart = function (part) {
    var taken = part.name;
    var photo = {};
    photo.source = 'upload';
    photo.path = part.filename;
    if (taken){
      // convert 2012:04:01 11:12:13 to ordinary datetime
      taken = taken.slice(0,10).split(':').join('-') + taken.slice(10);

      photo.client_mtime = taken;
    }

    // photo.bytes = file.length;
    photo.mime_type = part.mime;
    console.debug('saving in database', photo);
    importer.savePhotos(req.user, [photo], function(err, photos){
      console.debug('uploading %d photos to s3', photos.length);
      return self.save('original', photos[0], part, function(err, result){
        console.debug('upload done', photos.length);
        return done(err, result);
      });
    });
  };

  form.addListener('end', function () {
    // we need to have a callback here to activate the parsing..
  });

  // Do it
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
