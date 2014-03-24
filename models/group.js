// Group
// =====

var mongoose = require('mongoose'),
    Photo = require('./photo')(mongoose).Schema,
    _ = require('lodash'),
    Schema = mongoose.Schema;

var GroupSchema = new mongoose.Schema({
      value : { type: {}},
      userId : { type: Schema.Types.ObjectId, ref: 'User' },
      photos : { type: [Schema.Types.ObjectId], ref: 'Photo' },
      from : { type: Date },
      to : { type: Date }
    });


module.exports = mongoose.model('Group', GroupSchema);