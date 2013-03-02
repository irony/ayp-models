// Server initializations
// =====
// This contains the lower level initializations of the app


var app = require('./app').init();
var fs = require('fs');
var http = require('http');
var https = require('https');
var spdy = require('spdy');

// View routes
require('./routes/connectors')(app);
require('./routes/share')(app);
require('./routes/photos')(app);
require('./routes/import')(app);
require('./routes/index')(app);
require('./sockets/photos')(app);

// Api methods
require('./api/photos')(app);


/* The 404 Route (ALWAYS Keep this as the last route) */
require('./routes/404')(app);


var options = {
    ca:   fs.readFileSync(__dirname + '/../ssl/sub.class1.server.ca.pem'),
    key:  fs.readFileSync(__dirname + '/../ssl/ssl.key'),
    cert: fs.readFileSync(__dirname + '/../ssl/ssl.crt')
  };

// attach express handler function to TWO servers, one for http and one for https
app.listen(process.env.PORT || 3000);

//*console.log('Adding SPDY on 443');
//spdy.createServer(options, app.handle.bind(app)).listen(443);

//console.log("Listening on port %d in %s mode", app.address().port, app.settings.env);

