var mongoose = require('mongoose');

var models = module.exports = {
  group : require('./models/group'),
  photo : require('./models/photo'),
  photoCopy : require('./models/photoCopy'),
  sharespan : require('./models/sharespan'),
  user : require('./models/user'),
  auth : require('./auth/auth'),
  passport : require('./auth/passport'),
  init : function(config){
    try {
      mongoose.connect(config.mongoUrl);
      console.debug("Started connection on " + (config.mongoUrl.split('@').slice(-1)).cyan + ", waiting for it to open...".grey);
      return models;
    } catch (err) {
      console.log(("Setting up failed to connect to " + config.mongoUrl).red, err.message);
    }
  }
};
