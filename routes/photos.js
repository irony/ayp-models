var ViewModel = require('./viewModel');
var Photo = require('../models/photo');

module.exports = function(app){


  app.get('/photos', function(req, res){
    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    Photo.find({owners: req.user._id})
    .skip(Math.min(req.query.skip || 0))
    .limit(Math.min(req.query.limit || 50))
    .sort('-taken')
    .exec(function(err, photos){
    
      console.log('photos, err', err);
      model.photos = photos || [];

      res.render('photos.ejs', model);

    });
  });


  app.get('/photoFeed', function(req, res){

    var model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    Photo.find({'owners': req.user._id})
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 100)
    .sort('-taken')
    .exec(function(err, photos){
      res.end(JSON.stringify(photos));
    });
  });

  app.post('/photoRange', function(req, res){

    var startDate = req.body.dateRange.split(' - ')[0],
    stopDate = req.body.dateRange.split(' - ')[1],
    model = new ViewModel(req.user);

    if (!req.user){
      model.error = 'You have to login first';
      return res.render('500.ejs', model);
    }

    if (!req.body.dateRange){
      return res.end();
    }

    Photo.find({'owners': req.user._id})
    .limit(50)
    .where('taken').gte(startDate).lte(stopDate)
    .sort('-taken')
    .exec(function(err, photos){
      photos = (photos||[]).map(function(photo){
        return '/img/thumbnails/' + photo.source + '/' + photo._id;
      });
      res.end(JSON.stringify(photos));
    });
  });


};