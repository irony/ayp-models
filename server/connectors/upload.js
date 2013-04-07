var passport = require('passport');
var InputConnector = require('./inputConnector');
var importer = require('../../jobs/importer');
var formidable = require('formidable');
var util = require('util');

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
  var i = 0;
  var photo = {};

  form.onPart = function (part) {
    if (!part.filename) return form.handlePart(part);

    part.pause = function() {
      form.pause();
    };

    part.resume = function() {
      form.resume();
    };

    var quality = part.name.split('|')[0];
    var taken = part.name.split('|')[1];
    var length = part.name.split('|')[2]; // hack, should be set elsewhere?
    photo.source = 'upload';
    photo.bytes = length;
    photo.path = part.filename;
    photo.mimeType = part.mime;


    var put = global.s3.putStream(part, '/thumbnails/upload/test' + Math.random() * 1000 +'.jpg', {'Content-Length':length}, function(err, res){
      if (err) throw err;

      console.log('response', res);
      res.on('data', function(chunk){
        console.log(chunk.toString().red);
      });
    });

    put.on('progress', function(){
      console.log('progress', arguments);
    });
    /*if (taken){
      // convert 2012:04:01 11:12:13 to ordinary datetime
      taken = taken.slice(0,10).split(':').join('-') + taken.slice(10);

      photo.client_mtime = taken;
    }

    // photo.bytes = file.length;
    photo.mime_type = part.mime || 'image/jpeg';
    console.debug('saving in database', photo);
    importer.savePhotos(req.user, [photo], function(err, photos){
      if(err) return done(err);

      console.debug('uploading %d photos to s3', photos.length);
      return self.upload(quality + "s", photos[0], part, function(err, result){
        console.debug('upload done', err, result);
        return done(err, result);
      });
    });*/
  };

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
