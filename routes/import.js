
var ViewModel = require('./viewModel');
var Photo = require('../models/photo');
var _ = require('underscore');
var async = require('async');


module.exports = function(app){


  var savePhotos = function(user, photos, progress){

        async.map(photos, function(photo, next){

          Photo.findOne({'source' : photo.source, 'taken' : photo.client_mtime}, function(err, dbPhoto){

            if (err) {
              throw err;
            }

            if (!dbPhoto){
              dbPhoto = new Photo();
            }


            dbPhoto.set('owners', _.uniq(_.union([user._id], dbPhoto.owners)));

            dbPhoto.source = photo.source;
            dbPhoto.path = photo.path;
            dbPhoto.modified = photo.modified;
            dbPhoto.taken = photo.client_mtime;
            dbPhoto.interestingness = dbPhoto.interestingness || Math.random() * 100; // dummy value now. TODO: change to real one
            // dbPhoto.interestingness = dbPhoto.interestingness || 50;
            dbPhoto.metadata = photo;
            dbPhoto.bytes = photo.bytes;
            dbPhoto.mimeType = photo.mime_type;

            dbPhoto.save(function(err, savedPhoto){
              return progress(err, savedPhoto);
            });

          });
        }, function(err, savedPhotos){

          if (progress) progress(err, savedPhotos);

        });
  };


  app.get('/importing', function(req, res){
    res.render('importing', new ViewModel());
  });

  app.get('/import', function(req, res){

    if (!req.user || req.user === undefined){
      var model = new ViewModel(req.user);
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    if (req.user.accounts){

      _.each(req.user.accounts, function(account, connectorName){
        console.log('Evaluating', connectorName);

        var connector = require('../connectors/' + connectorName)(app);
        if (connector.downloadAllMetadata) {
            console.log('downloading metadata from', connectorName);

          connector.downloadAllMetadata(req.user, function(err, photos){
            if (err || !photos) return console.error(err);
            console.log('saving %d photos', photos.length);
            return savePhotos(req.user, photos, console.log);

          });
        }
      });

      res.redirect('/importing');

      // we will not return here since we have a process still waiting to be finished.
      // Not sure it will work without actual child-process?

    } else{
      throw "No compatible accounts are connected to this user";
    }


  });

};