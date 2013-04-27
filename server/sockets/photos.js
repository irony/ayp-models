// Photo Sockets
// =============
// Sockets for handling activity on a photo:
// * Viewing time
// * Clicks
// * Hide or show
// * Star / heart


var redis = require('redis');


module.exports = function(app){
  var Photo = require('../../models/photo');
  
  var client = redis.createClient();
  client.on('error', function(err){
    // ignore errors
    console.debug('error redis', err);
  });

  app.io.on('disconnect', function(){
    client.removeAllListeners('message');
  });

  app.io.on('connection', function (socket) {
    var user = socket.handshake.user;

    socket.join(user._id);
    client.subscribe(user._id); //    listen to messages from this user's pubsub channel
    client.on('message', function(channel, message) {
      socket.emit('trigger', JSON.parse(message)) ;
    });

    socket.on('views', function (photoId) {
      var setter = {$set : {modified : new Date()}, $inc : {}};
      setter.$inc['copies.' + user._id + '.views'] = 1;

      Photo.update({_id : photoId, owners: user._id}, setter, function(err, photo){
        console.log('views', photoId, photo);
      });
    });

    socket.on('click', function (photoId, seconds) {
      var setter = {$set : {modified : new Date()}, $inc : {}};
      setter.$inc['copies.' + user._id + '.clicks'] = 1;

      Photo.update({_id : photoId, owners: user._id}, setter, function(err, photo){
        if (err || !photo) return socket.emit('error', 'photo not found');

        socket.broadcast.to(user._id).emit('click', photoId);
      });
    });

    socket.on('hide', function (photoId, seconds) {
      var setter = {$set : {modified : new Date()}};
      setter.$set['copies.' + user._id + '.hidden'] = true;

      Photo.update({_id : photoId, owners: user._id}, setter, function(err, photo){
        if (err || !photo) return socket.emit('error', 'photo not found');

        socket.broadcast.to(user._id).emit('hide', photoId);
      });
    });

    socket.on('vote', function (photoId, value) {
      var setter = {$set : {modified : new Date()}};
      setter.$set['copies.' + user._id + '.vote'] = value;

      if (value > 0)
        setter.$set['copies.' + user._id + '.hidden'] = false;

      Photo.update({_id : photoId, owners: user._id}, setter, function(err, photo){
        if (err || !photo) return socket.emit('error', 'photo not found');

        socket.broadcast.to(user._id).emit('vote', photoId, value);
      });

    });

  });

};