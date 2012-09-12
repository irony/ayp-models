

var mongoose = require('mongoose'),
    User = require('./user')(mongoose).Schema,
    ShareSpan = require('./sharespan'),
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
  original : { type: String},
  tags : { type: []},
  metadata : { type:  Schema.Types.Mixed},
  folders : { type: []},
  sharedTo : { type: [User]},
  owners : {type: [User]}
});

PhotoSchema.pre('save', function (next) {
  
  var photo = this;

  ShareSpan.find({
    startDate: { $lte : photo.taken },
    stopDate: { $gte : photo.taken },
    members : { $in: photo.owners }
  }, function(err, spans){
    
    console.log('Found share spans:', spans);
    spans.forEach(function(span){
      console.log('Add members to photo');
      photo.set('owners', _.union(photo.owners, span.members));
      
      console.log('Photo should have all owners', JSON.stringify(photo.owners));

    });
    next();

  });


});


module.exports = mongoose.model('Photo', PhotoSchema);