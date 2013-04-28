
function PhotoController ($scope, $http){
  var socket = io.connect();
  var activePhoto = null;
  
  $scope.mouseMove = function(photo){
    console.log('move', photo._id);
      socket.emit('views', photo._id);
      activePhoto = photo;

      // photo.src = photo.src.replace('thumbnail', 'original');

      setTimeout(function(){
        if (activePhoto === photo)
          $scope.click(photo);
      }, 1000);
  };

  $scope.dragstart = function(photo){
    photo.class = 'clear';
  };

  $scope.rightclick = function(photo){
    photo.class = 'flip';
  };

  $scope.click = function(photo){

      $scope.startDate = photo.taken;
      // if someone views this image more than a few seconds - it will be counted as a click - otherwise it will be reverted
      if (photo.updateClick) {
        clearTimeout(photo.updateClick);
        socket.emit('click', photo._id, -1);
      } else {
        photo.updateClick = setTimeout(function(){
          socket.emit('click', photo._id, 1);
          console.log("click", photo);

          photo.src = photo.src.replace('thumbnail', 'original');

        }, 300);
      }

  };

  $scope.hide = function(photo, group){
    console.log('hide', photo);
    socket.emit('hide', photo._id);
    for(var i=0; i<group.photos.length; i++){
      if (group.photos[i]._id === photo._id)
        return delete group.photos[i];
    }
  };

  $scope.star = function(photo){
    socket.emit('star', photo._id);
    photo.starred = !photo.starred;
    console.log('star', photo);
  };


  $scope.starClass = function(photo){
    return photo && photo.starred ? "icon-heart" : "icon-heart-empty";
  };
}