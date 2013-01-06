var dbox  = require("dbox");
var config = require('../conf').dbox;
var dbox  = require("dbox");
var async  = require("async");
var dropbox   = dbox.app(config);
var passport = require('passport');
var Photo = require('../models/photo');
var User = require('../models/user');
var _ = require('underscore');
var ObjectId = require('mongoose').Types.ObjectId;
var fs = require('fs');


module.exports = function (app) {

  var self = this;

  /*
    Set up all routes to the connectors
  */

  fs.readdirSync(__dirname + '/../connectors').map(function(file){
    var connector = file.split('.')[0];
    console.log('setting up connector', connector);


    app.get('/auth/' + connector, passport.authenticate(connector));
    app.get('/auth/' + connector + '/callback', passport.authenticate(connector, { failureRedirect: '/' }),
      function(req, res) {
        res.redirect('/import');
      });
  });

  app.get('/img/thumbnails/:connector/:id', function(req,res){
    var id = req.params.id,
        connector = require('../connectors/' + req.params.connector)();

    Photo.findOne({'_id': id, 'owners':req.user._id}, function(err, photo){

      if ( err || !photo ) return res.send(403, err);

      console.log('Downloading thumbnail', req.params);

      connector.downloadThumbnail(req.user, photo, function(err, thumbnail){
        if (err) {
        console.error('Error downloading thumbnail', err);

          return res.send(500, new Error(err));
        }

        return res.end(thumbnail);
      });

    });
  });

  app.get('/img/originals/:connector/:id', function(req,res){
    var id = req.params.id,
        connector = require('../connectors/' + req.params.connector)();

    console.log('Downloading original', id);

    Photo.findOne({'_id': id, 'owners':req.user._id}, function(err, photo){

      if ( err || !photo ) return res.send(403, err);

      connector.downloadPhoto(req.user, photo, function(err, thumbnail){
        if (err) {
          return res.send(500, new Error(err));
        }

        return res.redirect(thumbnail.url);
      });

    });
  });

};
