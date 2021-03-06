var mongoose = require('mongoose');
var nconf = require('nconf');


var models = module.exports = require('require-dir')('./models');
models.passport = require('./auth/passport');
module.exports.init = function(_nconf){
  if (_nconf) nconf = _nconf;
  if (this.initialized) return models;
  if (!nconf.get('mongoUrl')) throw 'nconf not initialized';
  try {
    /*if (process.env.NODE_ENV !== 'production'){
      mongoose.set('debug', true);
    }*/

    mongoose.connect(nconf.get('mongoUrl'), { server: { auto_reconnect: false }}); // auto_reconnect forces db errors to propagate as errors instead of silent waits
    mongoose.connection.on('connected', function(){
      console.log('db connected to ' + nconf.get('mongoUrl'));
    });


    this.initialized = true;
    return models;
  } catch (err) {
    console.log(('Setting up failed to connect to ' + nconf.get('mongoUrl')).red, err.message);
  }
};
