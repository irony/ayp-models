// Places in the world. Cached data from 
// =====

var mongoose = require('mongoose');
var request = require('request');

var Place = new mongoose.Schema({
  location: {type: [Number], index: '2d'},
  place_id: {type:String, index: -1, unique: true},
  licence: {type:String},
  osm_type: {type:String},
  osm_id: {type:String},
  display_name: {type:String},
  address: [{}],
  created : { type: Date, default: Date.now }
});

Place.methods.fromLngLat = function(lng, lat, done) {
  return module.exports.findOne({

    location : { 
      $near : [lng, lat],
      $maxDistance : 20/6378137 // <distance in meters>
    }
  }, done);
}

Place.methods.lookup = function(lng, lat, done){
  this.fromLngLat(lng, lat, function(err, place){
    if (err || place) return done(err, place);
 
    request.get({
      json: true,
      headers: {'User-Agent' : 'AllYourPhotos.org, contact: christian@allyourphotos.org'},
      url: 'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng'.replace('$lat', lat).replace('$lng', lng) 
    }, function(err, res, location){
      var place = new module.exports(location);
      place.location = [lng, lat];
      place.save(done);
    });
  })
}


module.exports = mongoose.model('place', Place);