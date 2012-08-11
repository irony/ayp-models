

var mongoose = require('mongoose'),
	User = require('./user'),
    Schema = mongoose.Schema;

var PhotoSchema = new mongoose.Schema({
  id  :  { type: Schema.ObjectId},
  fileName : { type: String},
  date : { type: Date},
  source : { type: String},
  thumbnails : {type: {}},
  original : { type: String},
  tags : { type: []},
  metadata : { type: {}},
  folders : { type: []},
  sharedTo : { type: [Schema.Types.ObjectId]},
  owners : [User]
});
	
module.exports = mongoose.model('User', User.Schema);