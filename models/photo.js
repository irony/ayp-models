

var mongoose = require('mongoose'),
    User = require('./user')(mongoose).Schema,
    _ = require('underscore'),
    PhotoCopy = require('./photoCopy')(mongoose).Schema,

    Schema = mongoose.Schema;

var PhotoSchema = new mongoose.Schema({
      id  :  { type: Schema.ObjectId},
      path : { type: String},
      taken : { type: Date},
      modified : { type: Date},
      source : { type: String},
      mimeType : { type: String},
      thumbnails : {type: Schema.Types.Mixed},
      tags : [String],

      // copies.userId.views++
      copies : {}, // userId : {type: PhotoCopy}},

      metadata : { type:  Schema.Types.Mixed},
      exif : {},
      src : {type:String},

      store : {type:Schema.Types.Mixed},

      originalDownloaded : { type: Boolean, default: false},
      owners : [{ type: Schema.Types.ObjectId, ref: 'User' }]
    });

PhotoSchema.pre('save', function (next) {
  var photo = this,
      _ = require('underscore'),
      ShareSpan = require('./sharespan'); //this needs to be in local scope

  //photo.interestingness = photo.hidden ? 0 : photo.clicks * 10 + photo.views;

  // only on create
  if (!photo.id){
    ShareSpan.find({
      startDate: { $lte : photo.taken },
      stopDate: { $gte : photo.taken },
      members : { $in : photo.owners }
    }, function(err, spans){
      (spans || []).forEach(function(span){
        photo.set('owners', _.uniq(_.union(photo.owners, span.members)));
        //photo.save();
      });
      next();
    });
  }

});


module.exports = mongoose.model('Photo', PhotoSchema);