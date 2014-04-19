// Snapshot of users collection of groups
// =====

var mongoose = require('mongoose'),
    Group = require('./group'),
    Schema = mongoose.Schema;

var Snapshot = new mongoose.Schema({
  userId : { type: Schema.Types.ObjectId, ref: 'User' },
  groups : [Group],
  modified : { type: Date, default: Date.now }
});


module.exports = mongoose.model('snapshot', Snapshot);