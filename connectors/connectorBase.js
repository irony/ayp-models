function Connector(){
  
}

var extractExif = function(data, done){
  var ExifImage = require('exif').ExifImage;

  try {
      var exifExtractor = new ExifImage({ image : data}, function(err, exifArray){
        
        if (err || !exifArray)
          return done(err, null);

        var exif = {
          gps: exifArray.gps.reduce(function(content, item){
            console.log(item);
           content[item.tagName] = item.value;
           return content;
          }, {})
          ,
          exif: exifArray.exif.reduce(function(content, item){
           content[item.tagName] = item.value;
           return content;
          }, {})
          ,
          image: exifArray.image.reduce(function(content, item){
           content[item.tagName] = item.value;
           return content;
          }, {})
          ,
          raw : exifArray
        };
        return done(err, exif);
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
/*
    console.log('saving to s3', filename);
    global.s3.putFile('/' + filename, data, function(err, data){
      console.log('done', err, data);
      if (done) done(err, data);

    });*/


    var filename = '/' + folder + '/' + photo.source + '/' + photo._id;
    
    var req = global.s3.put(filename, {
            'Content-Length': data.length,
            'Content-Type': photo.mimeType
        });

    req.on('response', function(res){
      if (200 === res.statusCode && data) {

        extractExif(data, function(err, exif){

          photo.set('exif', exif || photo.exif);
          photo.markModified('exif');

          photo.store = photo.store || {};
          photo.store[folder] = photo.store[folder] || {};
          photo.store[folder] = {url:global.s3.datacenterUrl + filename, stored: new Date()};
          try{
            return photo.save(done);
          } catch(e){
            return done(new Error('Error when saving photo to database, error: ', e));
          }
        });

      } else return done(new Error('Error when saving to S3, code: ', res));
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