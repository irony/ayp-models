// Photo Copy
// ==========
// A copy of a photo for another user. Even for the owner of a photo they still have a PhotoCopy.

var mongoose = require('mongoose'),
    _ = require('lodash'),
    Schema = mongoose.Schema;


var PhotoCopy = new mongoose.Schema({
      user : {type: Schema.Types.ObjectId},
      interestingness : {type: Number, default: 50},
      views : { type: Number, default: 0},
      clicks : { type: Number, default: 0},
      hidden : { type: Boolean, default: false},
      vote : { type: Number, default: null},
      calculatedVote : { type: Number, default: 5},
      tags : { type: []},
      groups : { type: []},
      clusterOrder : { type: Number},
      top : { type: Number, default: null},
      rank : { type: Number, default: 50},
      cluster : {type : Number}
    });

module.exports = mongoose.models['PhotoCopy'] || mongoose.model('PhotoCopy', PhotoCopy);
