var passport = require('passport');
var Connector = require('./connectorBase');

module.exports = function () {

  this.scope = ['user_photos'];

  this.downloadThumbnail = function(user, photo, done){
    throw new Error('Not implemented');
  };

  this.downloadOriginal = function(user, photo, done){
    throw new Error('Not implemented');
  };

  this.downloadAllMetadata = function(user, progress){
    throw new Error('Not implemented');
  };

  this.getClient = function(user){
    throw new Error('Not implemented');
  };
  
  return this;
};

module.exports.prototype = Connector.prototype; //inherit from Connector base
