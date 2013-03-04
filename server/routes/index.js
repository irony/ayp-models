var ViewModel = require('./viewModel');
var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(app){
  app.get('/', function(req,res){

      var model = new ViewModel(req.user);


      var pusher = new Pusher(req, res, './client');
      
      async.map([
        '/fonts/fontawesome-webfont.woff',
        '/css/bootstrap.min.css',
        '/css/font-awesome.css',
        '/css/site.css',
        '/js/bootstrap.js',
        '/js/angular.min.js',
        '/js/jquery-1.7.1.min.js',
        '/js/socket.io.js',
        '/controllers/app.js',
        '/js/date-utils.min.js',
      ], pusher.pushFile, function(){
      
        // Make sure we have initiated all pushes before
        // sending the main document so it will parse faster
        res.render('template.ejs', model);

      });
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

/**
 * Push file with SPDY
 * @param  {[type]}   filename [description]
 * @param  {Function} done     [description]
 * @return {[type]}            [description]
 */
Pusher.prototype.pushFile = function(filename, done)
{
  var self = this;
  if (this.res.push){
    fs.stat(path.resolve(this.clientPath + filename), function (err, stat) {
      var etag;
      if (err) {
        console.log(err);
        return done && done(err);
      }
      else {
        var headers = {
          'Last-Modified' : stat.mtime,
          'Content-Length' : stat.size,
          ETag : stat.size + '-' + Date.parse(stat.mtime)
        };

        self.res.push(filename, headers, function(err, pushStream) {
          var fileStream = fs.createReadStream(path.resolve(self.clientPath + filename));
          fileStream.on('open', function () {
            fileStream.pipe(pushStream);
            return done();
          });
        });
      }
    });
  }
};