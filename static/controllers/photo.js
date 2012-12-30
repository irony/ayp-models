var socket = io.connect('/photos');

function PhotoController ($scope, $http){
  
  $scope.mouseMove = function(photo){
      socket.emit('views', photo._id);
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
        }, 300);
      }

  };

  $scope.hide = function(photo){
    console.log('hide', photo);
    socket.emit('hide', photo._id);
    photo.class = 'hidden';
  };

  $scope.star = function(photo){
    socket.emit('star', photo._id);
    photo.class = 'star';
    console.log('star', photo);
  };

}