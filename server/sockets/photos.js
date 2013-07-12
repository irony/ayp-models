// Photo Sockets
// =============
// Sockets for handling activity on a photo:
// * Viewing time
// * Clicks
// * Hide or show
// * Star / heart


var redis = require('redis');
var clusterer = require("../../jobs/clusterPhotos.js");

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

    if (!user || !user._id) return;



    // do a realtime analysis on the cluster change based on the latest action
    var recalculateCluster = function(photo, done){

      var query = {};
      var cluster = (photo.cluster || (photo.copies && photo.copies[user._id].cluster) || '').split('.')[0];
      if (!cluster) return;

      query['copies.' + user._id + '.cluster'] = new RegExp(cluster + '.*');
      Photo.find(query, 'store taken copies.' + user._id, function(err, photos){
        if (err || !photos.length) return console.log('cluster err'.red, err, cluster, photos);
        

        var group = clusterer.rankGroupPhotos({user : user._id, photos:photos.map(function(photo){
          var mine = photo.copies[user._id]; // transform the photoCopy
          mine._id = photo._id;
          mine.src = photo.src;
          mine.taken = photo.taken;
          return mine;
        }), _id : cluster});

        group = clusterer.saveGroupPhotos(group);

        if (group) socket.broadcast.to(user._id).emit('update', group.photos);
      });
    };

    socket.join(user._id);
    client.subscribe(user._id); //    listen to messages from this user's pubsub channel
    client.on('message', function(channel, message) {
      socket.emit('trigger', JSON.parse(message)) ;
    });

    socket.on('views', function (photoId) {
      var setter = {$set : {modified : new Date()}, $inc : {}};
      setter.$inc['copies.' + user._id + '.views'] = 1;
      
      // TODO : reload of all photos in same clusters
      //setter.$set['copies.' + user._id + '.cluster'] = null;

      Photo.update({_id : photoId, owners: user._id}, setter, function(err, photo){
        console.log('views', photoId, photo);
      });
    });

    socket.on('click', function (photo, seconds) {
      var setter = {$set : {modified : new Date()}, $inc : {}};
      setter.$inc['copies.' + user._id + '.clicks'] = 1;
      recalculateCluster(photo);

      Photo.update({_id : photo._id, owners: user._id}, setter, function(err, result){
        if (err || !result) return socket.emit('error', 'photo not found');

      });
    });

    socket.on('hide', function (photoId, seconds) {
      var setter = {$set : {modified : new Date()}};
      setter.$set['copies.' + user._id + '.hidden'] = true;



      // TODO : reload of all photos in same clusters
      //setter.$set['copies.' + user._id + '.cluster'] = null;

      Photo.update({_id : photoId, owners: user._id}, setter, function(err, photo){
        if (err || !photo) return socket.emit('error', 'photo not found');

        socket.broadcast.to(user._id).emit('hide', photoId);
      });
    });

    socket.on('vote', function (photo, value) {

      // console.log('vote', value);
      
      var setter = {$set : {modified : new Date()}};
      setter.$set['copies.' + user._id + '.vote'] = value;

      if (value > 0)
        setter.$set['copies.' + user._id + '.hidden'] = false;

      // TODO : reload of all photos in same clusters
      //setter.$set['copies.' + user._id + '.cluster'] = null;
      recalculateCluster(photo);


      Photo.update({_id : photo._id, owners: user._id}, setter, function(err, result){
        if (err || !photo) return socket.emit('error', 'photo not found');


        socket.broadcast.to(user._id).emit('vote', photo, value);
      });

    });

  });

};