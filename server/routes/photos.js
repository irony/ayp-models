var ViewModel = require('./viewModel');
var Photo = require('../../models/photo');
var Group = require('../../models/group');
var User = require('../../models/user');
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){

  app.get('/wall', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    res.render('groups.ejs', model);

  });

  app.get('/photos/random/:id', function(req, res){
    if (!req.user){
      return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
    }

    Photo.find({owners: req.user._id})
    .where('store.originals.stored').exists()
    .skip(Math.min(req.query.skip || 0))
    .limit(Math.min(req.query.limit || 50))
    .sort('-copies.' + req.user._id + '.interestingness')
    .exec(function(err, photos){

      var photo = photos && photos[Math.round(Math.random()*50)];
      if(!photo || !photo.store || !photo.store.originals ) {
        return res.redirect('http://lorempixel.com/1723/900/people/' + req.params.id);
      }
 
      res.redirect(photo.store.originals.url);

    });
  });


  app.get('/library', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }


    // Get an updated user record for an updated user maxRank.
    User.findOne({_id : req.user._id}, function(err, user){
      Photo.find({'owners': req.user._id}, 'copies.' + req.user._id + ' ratio taken store')
      .where('store.originals.url').exists(true)
      .limit(500)
//      .sort('-copies.' + req.user._id + '.interestingness')
      .sort('-taken')
      .exec(function(err, photos){
        // return all photos with just bare minimum information for local caching
        async.map((photos || []), function(photo, done){
          var mine = photo.copies[req.user._id] || {};

          if (!mine) return done(); // unranked images are not welcome here

          var vote = mine.vote || (mine.calculatedVote);
          photo.src = photo.store && photo.store.thumbnails ? photo.store.thumbnails.url : '/img/loading.gif';

          return done(null, {id: photo._id, mine: mine, src:photo.src, vote: Math.floor(vote), ratio: photo.ratio});
        }, function(err, photos){
          
          model.maxRank = user.maxRank;
          model.photos = photos;
          return res.render('library.ejs', model);

        });
      });
    });


  });


};