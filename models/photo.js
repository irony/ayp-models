

var mongoose = require('mongoose'),
	User = require('./user')(mongoose),
    Schema = mongoose.Schema;

var PhotoSchema = new mongoose.Schema({
  id  :  { type: Schema.ObjectId},
  path : { type: String},
  taken : { type: Date},
  modified : { type: Date},
  source : { type: String},
  mimeType : { type: String},
  thumbnails : {type: {}},
  original : { type: String},
  tags : { type: []},
  metadata : { type:  Schema.Types.Mixed},
  folders : { type: []},
  sharedTo : { type: [User]},
  owners : [User]
});
	
module.exports = mongoose.model('Photo', PhotoSchema);