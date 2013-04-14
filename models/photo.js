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
      src : {type:String},

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

PhotoSchema.pre('save', function (next) {
  var photo = this,
      _ = require('underscore'),
      ShareSpan = require('./sharespan'); //this needs to be in local scope
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