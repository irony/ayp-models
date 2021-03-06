// Photo
// =====
// Photo including all non-user specific properties. copies includes a list to all copies of this photo


var mongoose = require('mongoose'),
    nconf = require('nconf'),
    knox = require('knox'),
    moment = require('moment');

if (!nconf.get('aws')) {
  throw new Error('No aws config defined, please check nconf config');
}

var s3 = knox.createClient(nconf.get('aws')),
    Schema = mongoose.Schema;

var redis = require('redis');
var conf = nconf.get('redis');
var client = redis.createClient(conf.port, conf.host);


if (!nconf.get('redis')) throw 'nconf not initialized';


var Photo = new mongoose.Schema({
  path : { type: String},
  taken : { type: Date, index: true},
  modified : { type: Date, index: true},
  source : { type: String},
  mimeType : { type: String, index: true},
  copies : {}, // [PhotoCopy],
  bytes : {type: Number},

  metadata : { type:  Schema.Types.Mixed},

  // pointer to the current user's copy - will only be populated in runtime
  mine : { type:  Schema.Types.Mixed},
  exif : {}, // select:false
  ratio : {type:Number},
  store : {type:Schema.Types.Mixed},

  owners : [{ type: Schema.Types.ObjectId, ref: 'User', index: true }]
});

Photo.index({ taken: -1, owners: -1 }, { });
Photo.index({ 'store.original.stored': -1, owners: -1 }, { });
Photo.index({ 'store.thumbnail.stored': -1, owners: -1 }, { });
/*

Photo.pre('save', function (next) {
  var photo = this;
  
  Photo.findOne({taken : photo.taken, bytes: photo.bytes}, function(err, existingPhoto){
    if (existingPhoto) console.log('existingPhoto found')
    next(existingPhoto ? new Error('This photo is already in the database, please use the importer to initialize correct values') : null);
  });
});
*/

Photo.virtual('src').get(function (done) {
  var photo = this;
  if (photo.mimeType && photo.mimeType.split('/')[0] === 'video'){
    return '/img/novideo.jpg'; //photo.store && photo.store.original ? photo.store.original.url : '/img/novideo.mp4';
  } else {
    return photo.store && photo.store.thumbnail ? photo.store.thumbnail.url : '/img/Photos-icon.png';
  }
});

Photo.virtual('signedSrc').get(function () {
  var photo = this;
  var url = photo.store && photo.store.thumbnail && photo.store.thumbnail.url || photo.store && photo.store.preview && photo.store.preview.url;
  if (url && url.indexOf('phto.org') > -1) {
    url = url.split('phto.org').pop() || null;
    return url && s3.signedUrl(url, moment().add(1, 'year').startOf('year').toDate()) || null;
  } else {
    return url;
  }
});

Photo.methods.getLocation = function(){
  var photo = this;
  if (photo.exif && photo.exif.gps){

    if (photo.exif.gps.length){
      photo.exif.gps = photo.exif.gps.reduce(function(gps, tag){
        gps[tag.tagName] = tag.value;
        return gps;
      }, {});
    }
    var parseGPS = function(degree,minute,second) {
      return parseFloat(degree+(((minute*60)+(second))/3600), 10);
    };

    var location = {};
    if (photo.exif.gps.GPSLatitude && photo.exif.gps.GPSLatitude.length){
      location.lat = parseGPS(photo.exif.gps.GPSLatitude[0], photo.exif.gps.GPSLatitude[1], photo.exif.gps.GPSLatitude[2]);
      location.lng = parseGPS(photo.exif.gps.GPSLongitude[0], photo.exif.gps.GPSLongitude[1], photo.exif.gps.GPSLongitude[2]);
      
      if (photo.exif.gps.GPSLatitudeRef === 'S') location.lat = -location.lat;
      if (photo.exif.gps.GPSLongitudeRef === 'W') location.lng = -location.lng;

    } else {
      // console.log('could not extract gps');
    }
    return location;
  }
  return undefined;
};

Photo.methods.getMine = function (userId) {
  if (!userId) throw 'User parameter is required';

  var photo = this;
  var mine = photo.copies && photo.copies[userId] || {};
  var vote = mine.vote || (mine.calculatedVote);
  if (vote === null) vote = Math.floor(3+Math.random()*4);
  return {
    _id : photo._id,
    taken: photo.taken && photo.taken.getTime(),
    cluster: mine.cluster,
    rank: mine.rank,
    location : photo.location,
    views: mine.views,
    clicks: mine.clicks,
    src: photo.signedSrc,
    vote: Math.floor(vote),
    ratio: photo.ratio
  };
};

var sendQueue = {};
var _delay;

var send = function(){
  Object.keys(sendQueue).forEach(function(userId){
    if (sendQueue[userId].length) {
      client.publish(userId, JSON.stringify(sendQueue[userId]));
    }
  });
  sendQueue = {};
};

Photo.post('save', function () {
  var photo = this;
  if (photo.owners) {
    photo.owners.map(function(userId){
      var trigger = {
        action: 'save',
        type: 'photo',
        item: photo.getMine(userId)
      };
      sendQueue[userId] = sendQueue[userId] || [];
      sendQueue[userId].push(trigger); 
    });
    clearTimeout(_delay);
    _delay = setTimeout(send, 300);
  }
});

Photo.pre('save', function (next) {
  var photo = this,
      _ = require('lodash'),
      ShareSpan = require('./sharespan'); //this needs to be in local scope

  if (!photo.taken && !photo.owners) return next();

  ShareSpan.find({
    from: { $lte : photo.taken },
    to: { $gte : photo.taken },
    live: true,
    sender : { $in : photo.owners },
  }, function(err, spans){
    if (err) throw err;

    if (spans.length) console.debug('found %d share spans for this photo', spans.length);
    
    (spans || []).forEach(function(span){
      var mine = photo.copies && photo.copies[span.sender];
      if (!mine || span.vote < mine.vote) return;

      photo.set('owners', _.uniq(_.union(photo.owners, span.members)));
    });
    next();
  });

});

module.exports = mongoose.models['Photo'] || mongoose.model('Photo', Photo);
