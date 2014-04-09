// Photo
// =====
// Photo including all non-user specific properties. copies includes a list to all copies of this photo


var mongoose = require('mongoose'),
    nconf = require('nconf'),
    knox = require('knox'),
    moment = require('moment');

if (!nconf.get('aws')) {
  throw 'No aws config defined, please check nconf config';
}

var s3 = knox.createClient(nconf.get('aws')),
    Schema = mongoose.Schema;

var redis = require('redis');
var client = redis.createClient(nconf.get('redis'));


if (!nconf.get('redis')) throw 'nconf not initialized';

client.on('error', function(err){
  // ignore errors
  console.debug('error redis', err);
});


var PhotoSchema = new mongoose.Schema({
  path : { type: String},
  taken : { type: Date, index: true},
  modified : { type: Date},
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
/*

PhotoSchema.pre('save', function (next) {
  var photo = this;
  
  Photo.findOne({taken : photo.taken, bytes: photo.bytes}, function(err, existingPhoto){
    if (existingPhoto) console.log('existingPhoto found')
    next(existingPhoto ? new Error('This photo is already in the database, please use the importer to initialize correct values') : null);
  });
});
*/

PhotoSchema.virtual('src').get(function (done) {
  var photo = this;
  if (photo.mimeType && photo.mimeType.split('/')[0] === 'video'){
    return '/img/novideo.jpg'; //photo.store && photo.store.original ? photo.store.original.url : '/img/novideo.mp4';
  } else {
    return photo.store && photo.store.thumbnail ? photo.store.thumbnail.url : '/img/Photos-icon.png';
  }
});

PhotoSchema.virtual('signedSrc').get(function (done) {
  var photo = this;
  var url = photo.store && photo.store.thumbnail.url.split('phto.org').pop() || null;
  return url && s3.signedUrl(url, moment().add('year', 1).startOf('year').toDate()) || null;
});

PhotoSchema.methods.getMine = function (user) {
  var photo = this;
  var mine = photo.copies && photo.copies[user._id] || {};
  var vote = mine.vote || (mine.calculatedVote);
  return {
    _id : photo._id,
    taken: photo.taken && photo.taken.getTime(),
    cluster: mine.cluster,
    rank: mine.rank,
    src: photo.signedSrc,
    vote: Math.floor(vote),
    ratio: photo.ratio
  };
};
/*
PhotoSchema.post('save', function () {
  var photo = this;
  
  // only send trigger to sockets once the thumbnail is downloaded. This means we will skip sending out
  // info on the import step but rather at the download step
  if(photo.store && photo.store.thumbnail){
    photo.owners.map(function(userId){
      var trigger = {
        action: 'save',
        type: 'photo',
        item: { _id: photo._id, _taken : photo.taken }
      };
      try{
        client.publish(userId, JSON.stringify(trigger));
      } catch(err){
        console.log('Failed to save photo trigger to redis:'.red, err);
      }
    });
  }
});

PhotoSchema.pre('save', function (next) {
  var photo = this,
      _ = require('lodash'),
      ShareSpan = require('./sharespan'); //this needs to be in local scope

  if (!photo.taken && !photo.owners)
    return next();

  ShareSpan.find({
    startDate: { $lte : photo.taken },
    stopDate: { $gte : photo.taken },
    members : { $in : photo.owners }
  }, function(err, spans){
    if (err) throw err;

    if (spans.length) console.debug('found %d share spans for this photo', spans.length);
    
    (spans || []).forEach(function(span){

      photo.set('owners', _.uniq(_.union(photo.owners, span.members)));
      //photo.save();
    });
    next();
  });

});
*/

var Photo = module.exports = mongoose.model('Photo', PhotoSchema);