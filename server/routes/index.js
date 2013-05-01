var ViewModel = require('./viewModel');
var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(app){
  app.get('/', function(req,res){

      var model = new ViewModel(req.user);

      res.render('template.ejs', model, function(err, data){

        var pusher = new Pusher(req, res, './client');
        [
          //'/fonts/fontawesome-webfont.woff',
          '/css/bootstrap.min.css',
          '/css/font-awesome.css',
          '/css/site.css',
          '/js/bootstrap.js',
          '/js/angular.min.js',
          '/js/jquery-1.7.1.min.js',
          '/img/772-1267.jpg',
          //'/js/socket.io.js',
          '/controllers/app.js',
          '/img/allyourphotos.png'
        ].map(function(file){pusher.pushFile(file)});
        res.end(data);
      });


  });

  app.get('/about', function(req,res){

    var model = new ViewModel(req.user);

    res.render('about.ejs', model);
  });

  app.get('/me/upload', function(req,res){

    if(!req.user)
      return res.redirect("/");

    var model = new ViewModel(req.user);

    res.render('upload.ejs', model);
  });


  app.get('/pricing', function(req,res){

    var model = new ViewModel(req.user);

    res.render('pricing.ejs', model);
  });

};

/**
 * Pusher is a helper method for pushing to SPDY protocol (if enabled, otherwise it will be ignored.)
 * @param {express.request} req       Request
 * @param {express.response} res      Response
 * @param {string} clientPath         Relative path to client files (relative to app root), default: ./static/
 */
function Pusher(req, res, clientPath){
  this.req = req;
  this.res = res;
  this.clientPath = clientPath || './static';
}

var memoizedStat = async.memoize(fs.stat); // ec2 works too slow for file i/o
var memoizedReadFile = async.memoize(fs.readFile); // ec2 works too slow for file i/o

/**
 * Push file with SPDY
 * @param  {[type]}   filename [description]
 * @param  {Function} done     [description]
 * @return {[type]}            [description]
 */
Pusher.prototype.pushFile = function(filename, done)
{
  if (!this.res.push) return done && done();
  
  var self = this;

  memoizedStat(path.resolve(self.clientPath + filename), function (err, stat) {
    var etag;
    if (err) {
      console.log(err);
      return done && done(err);
    }
    else {
      var headers = {
        'Date' : stat.mtime,
        'Last-Modified' : stat.mtime,
        'Content-Length' : stat.size,
        'Cache-Control': 'public, max-age=31557600',
        'ETag' : stat.size + '-' + Date.parse(stat.mtime)
      };

      self.res.push(filename, headers, function(err, pushStream) {
        memoizedReadFile(path.resolve(self.clientPath + filename), function(err, data){
          if (err) return done(err);

          pushStream.end(data);
          return done && done();
        });
      });
    }
  });
};