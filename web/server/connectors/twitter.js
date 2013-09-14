var passport = require('passport');
var InputConnector = require('./inputConnector');

module.exports = function () {

  this.downloadThumbnail = function(user, photo, done){
    throw new Error('Not implemented');
  };

  this.downloadOriginal = function(user, photo, done){
    throw new Error('Not implemented');
  };

  this.importNewPhotos = function(user, progress){
    throw new Error('Not implemented');
  };

  this.getClient = function(user){
    throw new Error('Not implemented');
  };
  
  return this;
};

module.exports.prototype = InputConnector.prototype; //inherit from InputConnector base
