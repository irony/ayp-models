
var kue = require('kue')
  , cluster = require('cluster')
  , queue = kue.createQueue();

if (cluster.isMaster) {

  var numCPUs = require('os').cpus().length;

  for(var i=0; i<numCPUs; i++) cluster.fork();

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker: offline #' + worker.process.pid);
  });

  cluster.on('online', function(worker) {
    console.log("worker: online #" + worker.process.pid);
  });

  var port = process.env.PORT || 3000;
  kue.app.listen(port);
  console.log('UI started on port', port);

} else {

  var worker = require('./worker').start();

}
