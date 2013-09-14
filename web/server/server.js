// Server initializations
// =====
// This contains the lower level initializations of the app

var port = process.env.PORT || 3000;
var app = require('./app').init(port);
var http = require('http');
var https = require('https');

// View routes



// attach express handler function to TWO servers, one for http and one for https

//http.globalAgent.maxSockets = 50;

// app.spdy.listen(process.env.SSL_PORT || 8443);

console.log(process.env.HOST + ' started');

console.log("Listening on port %d in %s mode", port, global.debug && 'debug' || 'production');
