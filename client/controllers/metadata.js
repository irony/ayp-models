function MetadataCtrl($scope){
  
  $scope.star = function(photo){
    photo.vote = 0;
    socket.emit('vote', photo._id, 0);
    photo.starred = !photo.starred;
    console.log('star', photo);
  };


  $scope.hide = function(photo){
    photo.vote = 10;
    socket.emit('vote', photo._id, 10);
    photo.hidden = true;
    console.log('hide', photo);
  };

  $scope.rightClick = function(){
    $scope.$parentScope.selectedPhoto = null;

  };
  

}