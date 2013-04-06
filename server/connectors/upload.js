var passport = require('passport');
var InputConnector = require('./inputConnector');
var importer = require('../../jobs/importer');
var multiparty = require('multiparty');
var async = require('async');
var util = require('util');

/**
 * Writable stream with byte counter
 * @type {[type]}
 */
var Writable = require('readable-stream').Writable;
util.inherits(ByteCounter, Writable);
function ByteCounter(options) {
  Writable.call(this, options);
  this.bytes = 0;
}
ByteCounter.prototype._write = function(chunk, encoding, done) {
  this.bytes += chunk.length;
  done();
};


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
  var photo = {};

  form.on('part', function (part) {
    var quality = part.name.split('|')[0];
    var taken = part.name.split('|')[1];
    part.length = part.byteCount || part.name.split('|')[2]; // hack, should be set elsewhere?
    photo.source = 'upload';

    var counter = new ByteCounter();
    part.pipe(counter); // need this until knox upgrades to streams2
    part.on('end',function(){
      console.log('part end, size %d', counter.bytes);
    });
    photo.bytes = part.length;
    photo.path = part.filename;
    if (taken){
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
        console.debug('upload done', photos.length);
        return done(err, result);
      });
    });
  });

  form.on('close', function () {
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
