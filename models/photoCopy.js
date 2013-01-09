var mongoose = require('mongoose'),
    _ = require('underscore'),
    Schema = mongoose.Schema;

var PhotoCopy = new mongoose.Schema({
      interestingness : {type: Number, default: 50},
      views : { type: Number, default: 0},
      clicks : { type: Number, default: 0},
      hidden : { type: Boolean, default: false},
      starred : { type: Number, default: 0},
      tags : { type: []},
      groups : { type: []},
      rank : { type: Number, default: 0}
    });

module.exports = mongoose.model('PhotoCopy', PhotoCopy);
