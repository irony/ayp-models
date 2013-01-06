function Connector(){
  
}

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

/*
    console.log('saving to s3', filename);
    global.s3.putFile('/' + filename, data, function(err, data){
      console.log('done', err, data);
      if (done) done(err, data);

    });*/


    var filename = '/' + folder + '/' + photo.source + '/' + photo._id,
        req = global.s3.put(filename, {
            'Content-Length': data.length,
            'Content-Type': photo.mimeType
        });

    req.on('response', function(res){
      if (200 === res.statusCode) {
        return done();
      }
      return done(new Error('Error when saving to S3, code: ' + res));
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