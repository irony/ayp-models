// Share Span
// ==========
// A share span is a timeframe that connects all included members. All photos added within this timeframe
// from any users will be copied to all members.
// - - -
// TODO: Add a one-way option or active-flag per member


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ShareSpanSchema = new mongoose.Schema({
  added : { type: Date, default: Date.now},
  from: {type : Date},
  to: {type : Date},
  live : {type: Boolean, default: false},
  vote : {type: Number, default: 9},
  photos : [Schema.Types.ObjectId],
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receivers : [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

ShareSpanSchema.pre('save', function (next) {
  
  var span = this,
    _ = require('lodash'),
    Photo = require('./photo');

  Photo.find({}, '_id owners')
  .where('owners').in(span.sender)
  .where('copies.' + span.sender + '.vote').lte(span.vote || 9)
  .where('taken').gte(span.from).lte(span.to)
  //.or.where('photos').nin(span.photos) // TODO: make tests for updating existing
  .exec(function(err, photos){
    if (err) throw err;
    (photos || []).forEach(function(photo){
      photo.set('owners', _.uniq(_.union(photo.owners, span.receivers)));
      /*photo.save(function(err){
        if (!err){
          console.log('updating photos')
          span.photos.push(photo);
        }
      });*/
    });
    next();
  });
});

module.exports = mongoose.model('ShareSpan', ShareSpanSchema);