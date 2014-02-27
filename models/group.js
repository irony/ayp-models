// Group
// =====
// Not used anymore?

var mongoose = require('mongoose'),
    Photo = require('./photo')(mongoose).Schema,
    _ = require('lodash'),
    Schema = mongoose.Schema;

var GroupSchema = new mongoose.Schema({
      value : { type: {}},
      userId : { type: Schema.Types.ObjectId },
      photos : { type: []},
      from : { type: Date },
      to : { type: Date }
    });


module.exports = mongoose.model('Group', GroupSchema);