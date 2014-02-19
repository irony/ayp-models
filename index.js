var mongoose = require('mongoose');
var nconf = require('nconf');

nconf
  .env() // both use environment and file
  .file({file: 'config.json', dir:'../', search: true});


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
      /*if (process.env.NODE_ENV !== 'production'){
        mongoose.set('debug', true);
      }*/

      mongoose.connect(nconf.get('mongoUrl'));
      mongoose.connection.on('connected', function(){
        console.log('db connected to ' + nconf.get('mongoUrl'));
      });


      return models;
    } catch (err) {
      console.log(("Setting up failed to connect to " + nconf.get('mongoUrl')).red, err.message);
    }
  }
};
