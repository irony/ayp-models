
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var AccountSchema = new mongoose.Schema({
	displayName : {type: String},
	// TODO etc
});

var UserSchema = new mongoose.Schema({
  id  :  { type: Schema.ObjectId},
  displayName : { type: String},
  emails : { type: []},
  accounts : {type :  Schema.Types.Mixed},
  updated : {type: Date}
});

module.exports = mongoose.model('User', UserSchema);

