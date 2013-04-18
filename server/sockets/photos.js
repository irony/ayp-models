// Photo Sockets
// =============
// Sockets for handling activity on a photo:
// * Viewing time
// * Clicks
// * Hide or show
// * Star / heart
// TODO: Add session management / authentication with express - socket.io

module.exports = function(app){
  var Photo = require('../../models/photo');
  
  app.io.of('/photos').on('connection', function (socket) {
    var user = socket.handshake.user;
    socket.on('views', function (photoId) {
      var setter = {$set : {modified : new Date()}, $inc : {}};
      setter.$inc['copies.' + user._id + '.views'] = 1;

      Photo.update({_id : photoId}, setter, function(err, photo){
        console.log('views', photoId, photo);
      });
    });

    socket.on('click', function (photoId, seconds) {
      var setter = {$set : {modified : new Date()}, $inc : {}};
      setter.$inc['copies.' + user._id + '.clicks'] = 1;

      Photo.update({_id : photoId}, setter, function(err, photo){
        socket.broadcast.emit('click', photoId);
      });
    });

    socket.on('hide', function (photoId, seconds) {
      var setter = {$set : {modified : new Date()}};
      setter.$set['copies.' + user._id + '.hidden'] = true;

      Photo.update({_id : photoId}, setter, function(err, photo){
        socket.broadcast.emit('hide', photoId);
      });
    });

    socket.on('vote', function (photoId, value) {
      var setter = {$set : {modified : new Date()}};
      setter.$set['copies.' + user._id + '.vote'] = value;
      setter.$set['copies.' + user._id + '.hidden'] = false;

      Photo.update({_id : photoId}, setter, function(err, photo){
        socket.broadcast.emit('vote', photoId, value);
      });

    });

  });

};