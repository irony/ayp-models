// Clusters of users collection of groups
// =====

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Cluster = new mongoose.Schema({
  userId : { type: Schema.Types.ObjectId, ref: 'User' },
  groups : [{}],
  centroids : [],
  modified : { type: Date, default: Date.now }
});

module.exports = mongoose.models['cluster'] || mongoose.model('cluster', Cluster);
