function InputConnector(name){
  this.name = name;
}

var ImageHeaders = require("image-headers");
var Photo = require("../../models/photo");

InputConnector.prototype.extractExif = function(data, done){

  if (!done) throw new Error("Callback is mandatory");

  try {

      var headers = new ImageHeaders();
      headers.add_bytes(data.slice(0, Math.min(data.length, headers.MAX_SIZE)));
      return headers.finish(function(err, exif){
        done(err, exif);
      });

  } catch (error) {
    return done(error, null);
  }
};

// Used to request specieal permissions from example facebook
InputConnector.prototype.scope = {};

InputConnector.prototype.downloadThumbnail = function(user, photo, done){
  done(new Error('Not implemented'));
};


InputConnector.prototype.downloadOriginal = function(user, photo, done){
  done( new Error('Not implemented'));
};


InputConnector.prototype.importNewPhotos = function(user, progress){
  throw new Error('Not implemented');
};


InputConnector.prototype.getClient = function(user){
  throw new Error('Not implemented');
};

InputConnector.prototype.upload = function(folder, photo, stream, done){

  if (!done) throw new Error("Callback is mandatory");
  if (!photo.mimeType) throw new Error("Mimetype is mandatory");

  if (!stream || !stream.pipe) return done(new Error('No stream'));

/*    global.s3.putFile('/' + filename, stream, function(err, stream){
      console.log('done', err, stream);
      if (done) done(err, stream);

    });*/

  var self = this;
  var filename = '/' + folder + '/' + photo.source + '/' + photo._id;
  var headers = {
          'Content-Length': stream.byteCount,
          'Content-Type': photo.mimeType,
          'x-amz-acl': 'public-read',
          'Cache-Control': 'public,max-age=31556926'
      };

  console.debug('uploading ', headers);

  var req = global.s3.putStream(stream, filename, headers, function(err, res){
        if (err) return done(err);

        if (200 === res.statusCode || 307 === res.statusCode) {
          console.debug('Extracting exif...');
          self.extractExif(stream, function(err, headers){
          
            if (err) console.debug('ERROR: Could not read EXIF of photo %s', photo._id, err);
            var setter = {$set : {}};
            setter.$set['store.' + folder] = {url:req.url, stored: new Date()};
            if (headers && headers.exif_data) setter.$set.exif = headers.exif_data;
            if (headers && headers.width && headers.height) {
              setter.ratio = headers.width / headers.height;
              setter.$set['store.' + folder].width = headers.width;
              setter.$set['store.' + folder].height = headers.height;
            }
            
            console.debug('Saving %s to db...', folder);
            return photo.update(setter, {upsert: true, safe:true}, function(err){
              console.debug('Done saving to db...', err);
              return done(err, photo);
            });
          });

        } else {
          res.on('data', function(chunk){
            console.log(chunk.toString().red);
          });
          return done(new Error('Error when saving to S3, code: '.red, res));
        }
      });

  //console.log('saving %s to s3', folder, req);
  req.on('data', function(data) {
    console.debug('S3 Response: ', data.toString());
  });
  req.on('error', function(err) {
    console.debug('Request error when saving to S3: %s'.red, err);
  });
  req.on('progress', function(e){
    console.debug('progress', e);
  });

  /*if (stream.pipe){
    console.log('Piping to s3');
    return stream.pipe(req);
  } else {
    return req.end(stream);
  }*/

  /*
  console.log('save', filename)
  var mkdirp = require('mkdirp'),
      fs = require('fs'),
      p = require('path'),
      pathArray = filename.split('/');

  pathArray.pop(); // remove file part

  mkdirp(pathArray.join('/'), function (err) {
    if (err && done) done(err);
  });

  fs.writeFile(filename, data, done);*/
};

module.exports = InputConnector;