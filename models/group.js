// Group
// =====
// Not used anymore?

var mongoose = require('mongoose'),
    Photo = require('./photo')(mongoose).Schema,
    _ = require('underscore'),
    Schema = mongoose.Schema;

var GroupSchema = new mongoose.Schema({
      _id  :  { type: String },
      value : { type: {}}
    });

module.exports = mongoose.model('Group', GroupSchema);