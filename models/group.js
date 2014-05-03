// Group
// =====

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new mongoose.Schema({
  value : { type: Number},
  userId : { type: Schema.Types.ObjectId, ref: 'User' },
  photos : [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
  from : { type: Date },
  to : { type: Date },
  centroids : {type: {}},
  modified : { type: Date, default: Date.now }
});


module.exports = mongoose.model('Group', GroupSchema);