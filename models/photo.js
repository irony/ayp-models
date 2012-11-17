

var mongoose = require('mongoose'),
    User = require('./user')(mongoose).Schema,
    _ = require('underscore'),
    Schema = mongoose.Schema;

var PhotoSchema = new mongoose.Schema({
  id  :  { type: Schema.ObjectId},
  path : { type: String},
  taken : { type: Date},
  modified : { type: Date},
  source : { type: String},
  mimeType : { type: String},
  thumbnails : {type: Schema.Types.Mixed},
  interestingness : {type: Number, default: 50},
  original : { type: String},
  tags : { type: []},
  metadata : { type:  Schema.Types.Mixed},
  folders : { type: []},
  sharedTo : { type: [User]},
  owners : [Schema.ObjectId]
});

PhotoSchema.pre('save', function (next) {
  var photo = this,
      _ = require('underscore'),
      ShareSpan = require('./sharespan'); //this needs to be in local scope

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

});


module.exports = mongoose.model('Photo', PhotoSchema);