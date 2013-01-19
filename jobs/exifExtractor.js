var blitline = require('blitline')
    Photo = require('../models/photo');


module.exports = {


  extractExifFromNewPhotos : function(autoRestart){

    var photoQuery = Photo.find()
    .where('store.originals.stored').exists()
    .where('exif').exists(false)
    .sort('-modified').limit(50);
    var parseAllResults = function parseAllResults(err, photos){
      // console.log('[50]Found %d photos without downloaded images. Downloading...', photos.length);

      async.map(photos, function(photo, done){
        process.stdout.write('.');
        done(null, photo); // ignore errors since we want to continue
      }, function(err, photos){
        
        console.log('Downloaded Exif information for %d photos', _.compact(photos).length);
  
        if(autoRestart)
          photoQuery.exec(parseAllResults);
      });
    };
    
    photoQuery.exec(parseAllResults);

  }

};