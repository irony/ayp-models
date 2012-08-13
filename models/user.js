

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  id  :  { type: Schema.ObjectId},
  displayName : { type: String},
  emails : { type: []},
  accounts : {type : {}},
  updated : {type: Date}
});
	
module.exports = mongoose.model('User', UserSchema);