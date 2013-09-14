
var ViewModel = require('./viewModel');
var Photo = require('../../models/photo');
var _ = require('lodash');
var async = require('async');
var importer = require('../../jobs/importer');
var downloader = require('../../jobs/downloader');


module.exports = function(app){

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

      console.log('Importing and downloading for user %s', req.user._id);
      importer.importPhotosFromAllConnectors(req.user, function(err, photos){
        console.log('%d photos imported. ', photos && photos.length, photos, err);
      });
      downloader.downloadThumbnails(req.user, function(err, result){
        console.log('%d photos downloaded. ', result && result.length, result, err);
      });

      res.redirect('/importing');


    } else{
      throw "No compatible accounts are connected to this user";
    }


  });

};