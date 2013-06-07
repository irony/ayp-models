
function PhotoController ($scope, $http){
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
    event.preventDefault();
  };

  $scope.rightclick = function(photo){
    var meta = $('#meta')[0];
    $scope.selectedPhoto = photo;
    angular.copy(event.target.style, meta.style);
    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
    });

  };

  $scope.click = function(photo){

    if ($scope.selectedPhoto === photo)
      $scope.select(null);
    else
      $scope.select(photo);


    // if someone views this image more than a few moments - it will be counted as a click - otherwise it will be reverted
    if (photo.updateClick) {
      clearTimeout(photo.updateClick);
      socket.emit('click', photo._id, -1);
    } else {
      photo.updateClick = setTimeout(function(){
        socket.emit('click', photo._id, 1);
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


  $scope.starClass = function(photo){
    return photo && photo.starred ? "icon-heart" : "icon-heart-empty";
  };
}