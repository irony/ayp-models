

var mongoose = require('mongoose'),
    User = require('./user')(mongoose).Schema,
    Photo = require('./photo'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

var ShareSpanSchema = new mongoose.Schema({
  added : { type: Date, default: Date.now()},
  startDate: {type : Date},
  stopDate: {type : Date},
  photos : [Schema.Types.ObjectId],
  members : [Schema.Types.ObjectId]
});



ShareSpanSchema.pre('save', function (next, done) {
  
  var span = this;

  Photo.find()
  .where('owners').in(span.members)
  .where('photos').nin(span.photos)
  .where('taken').gte(span.startDate).lte(span.stopDate)
  .exec(function(err, photos){
    console.log('sharespan save');
    (photos || []).forEach(function(photo){
      photo.set('owners', _.uniq(_.union(photo.owners, span.members)));
    });
    next();
  });
});

module.exports = mongoose.model('ShareSpan', ShareSpanSchema);