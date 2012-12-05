module.exports = function(app){
  var io = require('socket.io').listen(app);
  var Photo = require('../models/photo');
  

  io.of('/photos').on('connection', function (socket) {
      console.log('connect');
    
    socket.on('views', function (photoId) {
      Photo.update({_id : photoId}, {$inc : {views: 1}}, function(err, photo){
        console.log('views', photoId, photo);
      });
    });

    socket.on('click', function (photoId, seconds) {
      Photo.update({_id : photoId}, {$inc : {clicks: seconds}}, function(err, photo){
        console.log('click', photoId, photo);
      });
    });

    socket.on('hide', function (photoId, seconds) {
      Photo.update({_id : photoId}, {hidden : true}, function(err, photo){
        console.log('hide', photoId, photo);
      });
    });

    socket.on('star', function (photoId) {

      Photo.update({_id : photoId}, {$inc : {starred: 1}}, function(err, photo){
        console.log(photo)
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