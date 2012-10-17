var User = require('../models/user'),
    _ = require('underscore'),
    callbackBaseUrl = "http://" + (process.env.HOST || "localhost:3000");

var updateProfile = function(user, profile, done){

  if (!user)
  {
    throw new Error("User must have a value");
  }

  var accounts = (user.accounts || {});
  var emails = (user.emails || []);

  accounts[profile.provider] = profile;

  user.updated = new Date();

  user.set('emails', _.union(emails, profile.emails.map(function(item){return item.value;})));

  user.displayName = profile.displayName;
//   user.set('emails', emails);
  user.set('accounts', accounts);

  return user.save(function(err, savedUser){
    done(err, savedUser);
  });
};

var findOrCreateAndUpdateUser = function (user, profile, done)
{

  // even if we have the serialized user object, we still want to use the db user so we can save and update it correctly
  if (user && user._id){
    return User.findOne(user._id, function(err, foundUser){

      if (!foundUser){
        foundUser = new User(user);
      }

      return updateProfile(foundUser, profile, done);
  
    });
  }

  // we will use many providers but still want's to connect them to the same account,
  // therefore we will search for this user according to it's id for this particular provider,
  // if no one is found we will create it. If found we will update the accounts.

  return User.findOne({ '$where' : 'this.accounts && this.accounts["' + profile.provider + '"] && this.accounts["' + profile.provider + '"].id == ' + profile.id }, function (err, foundUser) {

      if (err){
        return done(err, null);
      }

      if (!foundUser) {
        user = new User();
      } else {
        user = foundUser;
      }


      return updateProfile(user, profile, done);

  });
};


exports.findOrCreateAndUpdateUser = findOrCreateAndUpdateUser;
exports.updateProfile = updateProfile;
