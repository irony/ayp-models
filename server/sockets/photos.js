// Photo Sockets
// =============
// Sockets for handling activity on a photo:
// * Viewing time
// * Clicks
// * Hide or show
// * Star / heart
// 
// TODO: Add session management / authentication with express - socket.io

module.exports = function(app){
  var io = require('socket.io').listen(app);
  var Photo = require('../../models/photo');
  

  io.of('/photos').on('connection', function (socket) {
    socket.on('views', function (photoId) {
      Photo.update({_id : photoId}, {$inc : {views: 1}, $set : {modified : new Date()}}, function(err, photo){
        console.log('views', photoId, photo);
      });
    });

    socket.on('click', function (photoId, seconds) {
      Photo.update({_id : photoId}, {$inc : {clicks: seconds}, $set : {modified : new Date()}}, function(err, photo){
        console.log('click', photoId, photo);
      });
    });

    socket.on('hide', function (photoId, seconds) {
      Photo.update({_id : photoId}, {$set : {modified : new Date(), hidden : true}}, function(err, photo){
        console.log('hide', photoId, photo);
      });
    });

    socket.on('star', function (photoId) {

      Photo.update({_id : photoId}, {$inc : {starred: 1}, $set : {modified : new Date()}}, function(err, photo){
        console.log('starred', photo);
      });

      /*Photo.findById(photoId, function(err, photo){
        if (photo){
          photo.starredBy = (photo.starredBy || []).push(userId);
          console.log('starred by ', photo);
          photo.save();
        }
      });*/
    });

  });

};