

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  firstName  :  { type: String},
  lastName :  { type: String},
  id   :  { type: String, unique: true },
  dropboxDetails : {type: {}}
});


module.exports = mongoose.model('User', UserSchema);