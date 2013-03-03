
var ViewModel = require('./viewModel');
var Photo = require('../../models/photo');
var _ = require('underscore');
var async = require('async');


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
      importer.importPhotosFromAllConnectors(req.user, function(photos){
        // console.log('%d photos imoprted', photos && photos.length); // may be called more than one time
      });

      res.redirect('/importing');

      // we will not return here since we have a process still waiting to be finished.
      // Not sure it will work without actual child-process?

    } else{
      throw "No compatible accounts are connected to this user";
    }


  });

};