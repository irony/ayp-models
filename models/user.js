

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongooseAuth = require('mongoose-auth');

var UserSchema = new mongoose.Schema({
  firstName  :  { type: String},
  lastName :  { type: String},
  id   :  { type: String, unique: true },
  dropboxDetails : {type: {}}
}), User;



// STEP 1: Schema Decoration and Configuration for the Routing
UserSchema.plugin(mongooseAuth, {
  // Here, we attach your User model to every module
  everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
      }
    },

  facebook: {
      everyauth: {
          myHostname: 'http://localhost:3000'
        , appId: 'YOUR APP ID HERE'
        , appSecret: 'YOUR APP SECRET HERE'
        , redirectPath: '/'
      }
    }
});


module.exports = UserSchema;
