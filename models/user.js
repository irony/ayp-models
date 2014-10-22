
var mongoose = require('mongoose');
var nconf = require('nconf');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var jwt = require('jsonwebtoken');
var jwt_secret = nconf.get('sessionSecret');

var User = new mongoose.Schema({
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


User.methods.generateToken = function (done) {
  var user = this;
  // We are sending the profile inside the token
  var token = jwt.sign({_id: user._id, displayName : user.displayName}, jwt_secret, { expiresInMinutes: 60*24 });
  user.set('token', token);
  user.save(function(){
    done(token);
  });
  return token;
};


User.plugin(passportLocalMongoose);

module.exports = mongoose.models['User'] || mongoose.model('User', User);
