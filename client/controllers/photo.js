var socket = io.connect();

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

  $scope.rightClick = function(photo){
    if ($scope.selectedPhoto === photo)
      return $scope.select(null);
    
    var meta = $('#meta')[0];
    $scope.selectedPhoto = photo;
    angular.copy(event.target.style, meta.style);
    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
    });
    
    return true;
  };

  $scope.click = function(photo){

    if ($scope.selectedPhoto === photo){
      clearTimeout(photo.updateClick);
      $scope.select(null);
    }
    else {
      $scope.select(photo);
      photo.updateClick = setTimeout(function(){
        socket.emit('click', photo, 1);
      }, 300);
    }

  };

  $scope.hide = function(photo, group){
    console.log('hide', photo);
    socket.emit('hide', photo._id);
    photo.vote = 10;
  };


  socket.on('update', function(photos){
    $scope.apply(function(){
      _.each(photos, function(photo){
        _.first($scope.photos, {_id : photo._id}, function(existing){
          _.assign(existing, photo);
        });
      });
    });
  });

}