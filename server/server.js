// Server initializations
// =====
// This contains the lower level initializations of the app


var app = require('./app').init();
var http = require('http');
var https = require('https');

// View routes



// attach express handler function to TWO servers, one for http and one for https
app.listen(process.env.PORT || 3000);

//http.globalAgent.maxSockets = 50;

// app.spdy.listen(process.env.SSL_PORT || 8443);

console.log(process.env.HOST + ' started');

console.log("Listening on port %d in %s mode", app.address());
