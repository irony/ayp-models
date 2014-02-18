var mongoose = require('mongoose');
var nconf = require('nconf');

var models = module.exports = {
  group : require('./models/group'),
  photo : require('./models/photo'),
  photoCopy : require('./models/photoCopy'),
  sharespan : require('./models/sharespan'),
  user : require('./models/user'),
  auth : require('./auth/auth'),
  passport : require('./auth/passport'),
  init : function(){
    try {
      mongoose.connect(nconf.get('mongoUrl'));
      return models;
    } catch (err) {
      console.log(("Setting up failed to connect to " + nconf.get('mongoUrl')).red, err.message);
    }
  }
};
