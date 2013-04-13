// Server initializations
// =====
// This contains the lower level initializations of the app


var app = require('./app').init();
var fs = require('fs');
var http = require('http');
var https = require('https');
var spdy = require('spdy');

// View routes


var options = {
    ca:   fs.readFileSync(__dirname + '/../ssl/sub.class1.server.ca.pem'),
    key:  fs.readFileSync(__dirname + '/../ssl/ssl.key'),
    cert: fs.readFileSync(__dirname + '/../ssl/ssl.crt')
  };

// attach express handler function to TWO servers, one for http and one for https
app.listen(process.env.PORT || 3000);

//http.globalAgent.maxSockets = 50;

spdy.createServer(options, app.handle.bind(app)).listen(process.env.SSL_PORT || 8443);

console.log('App started');

console.log("Listening on port %d in %s mode", app.address());

