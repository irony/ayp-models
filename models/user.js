
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  id  :  { type: Schema.ObjectId},
  displayName : { type: String},
  username : { type: String},
  password : { type: String},
  token : { type: String },
  emails : { type: []},
  accounts : {type :  Schema.Types.Mixed},
  subscription : {type: Date, default: new Date(new Date().setMonth(new Date().getMonth() + 1)) },
  maxRank : {type : Number},
  updated : {type: Date}
});


UserSchema.methods.generateToken = function (done) {
  var user = this;
  require('crypto').randomBytes(24, function(ex, buf) {
    var token = buf.toString('hex');
    user.set('token', token);
    user.save(function(){
      done(token);
    });
  });
};


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.models['User'] || mongoose.model('User', UserSchema);
