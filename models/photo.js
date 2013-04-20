// Photo
// =====
// Photo including all non-user specific properties. copies includes a list to all copies of this photo


var mongoose = require('mongoose'),
    User = require('./user')(mongoose).Schema,
    _ = require('underscore'),
    PhotoCopy = require('./photoCopy')(mongoose).Schema,

    Schema = mongoose.Schema;

var PhotoSchema = new mongoose.Schema({
      path : { type: String},
      taken : { type: Date},
      modified : { type: Date},
      source : { type: String},
      mimeType : { type: String},
      copies : {}, // [PhotoCopy],
      bytes : {type: Number},

      metadata : { type:  Schema.Types.Mixed},

      // pointer to the current user's copy - will only be populated in runtime
      mine : { type:  Schema.Types.Mixed},
      exif : {},
      ratio : {type:Number},
      store : {type:Schema.Types.Mixed},

      owners : [{ type: Schema.Types.ObjectId, ref: 'User' }]
    });
/*

PhotoSchema.pre('save', function (next) {
  var photo = this;
  
  Photo.findOne({taken : photo.taken, bytes: photo.bytes}, function(err, existingPhoto){
    if (existingPhoto) console.log('existingPhoto found')
    next(existingPhoto ? new Error("This photo is already in the database, please use the importer to initialize correct values") : null);
  });
});
*/

PhotoSchema.virtual('src').get(function (done) {
  var photo = this;
  if (photo.mimeType && photo.mimeType.split('/')[0] === 'video'){
    return '/img/novideo.jpg'; //photo.store && photo.store.originals ? photo.store.originals.url : '/img/novideo.mp4';
  } else {
    return photo.store && photo.store.thumbnails ? photo.store.thumbnails.url : '/img/Photos-icon.png';
  }
});

PhotoSchema.post('save', function (next) {
  var redis = require('redis');
  var client = redis.createClient();
  var photo = this;
  photo.owners.map(function(userId){
    var trigger = {
      action: 'save',
      type: 'photo',
      item: photo
    };
    client.publish(userId, JSON.stringify(trigger));
  });
});

PhotoSchema.pre('save', function (next) {
  var photo = this,
      _ = require('underscore'),
      ShareSpan = require('./sharespan'); //this needs to be in local scope

  if (!photo.taken && !photo.owners)
    return next("no date defined");

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


var Photo = module.exports = mongoose.model('Photo', PhotoSchema);