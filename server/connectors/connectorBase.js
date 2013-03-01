function Connector(){
  
}

var ImageHeaders = require("image-headers");

var extractExif = function(data, done){

  try {

      var headers = new ImageHeaders();
      headers.add_bytes(data.slice(0, headers.MAX_SIZE));
      return headers.finish(function(err, exif){
        done(err, exif);
      });

  } catch (error) {
    return done(error, null);
  }
};

// Used to request specieal permissions from example facebook
Connector.prototype.scope = {};

Connector.prototype.downloadThumbnail = function(user, photo, done){
  throw new Error('Not implemented');
};


Connector.prototype.downloadPhoto = function(user, photo, done){
  throw new Error('Not implemented');
};


Connector.prototype.downloadAllMetadata = function(user, progress){
  throw new Error('Not implemented');
};


Connector.prototype.getClient = function(user){
  throw new Error('Not implemented');
};

Connector.prototype.save = function(folder, photo, data, done){


  if (!data) return done(new Error('No data'));

/*    global.s3.putFile('/' + filename, data, function(err, data){
      console.log('done', err, data);
      if (done) done(err, data);

    });*/


    var filename = '/' + folder + '/' + photo.source + '/' + photo._id;
    
    var req = global.s3.put(filename, {
            'Content-Length': data.length,
            'Content-Type': photo.mimeType
        });

    //console.log('saving %s to s3', folder, req);
    req.on('error', function(err) {
      console.log('Request error when saving to S3: %s', err.toString().red);
    });

    req.on('response', function(res){
      if (200 === res.statusCode && data) {
        extractExif(data, function(err, headers){

          if (err) console.log('Could not read EXIF of photo %s', photo._id, err);

          if (headers.exif_data){
            photo.set('exif', headers.exif_data || photo.exif);
          }

          if (headers.width && headers.height){
            photo.ratio = headers.width / headers.height;
          }

          photo.store = photo.store || {};
          photo.store[folder] = photo.store[folder] || {};
          photo.store[folder] = {url:req.url, stored: new Date()};
          try{
            return photo.save(function(err, data){
              process.stdout.write(err ? '.'.red : '.'.green);
              return done(err, data);
            });
          } catch(e){
            return done(new Error('Error when saving photo to database, error: ', e));
          }
        });

      } else {
        return done(new Error(String.format('Error when saving to S3, code: %s', res.statusCode)));
      }
    });

    return req.end(data);

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

module.exports = Connector;