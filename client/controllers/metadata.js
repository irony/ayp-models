function MetadataCtrl($scope){
  
  $scope.star = function(photo){
    socket.emit('vote', photo._id, 0);
    photo.starred = !photo.starred;
    console.log('star', photo);
    photo.vote = 0;
  };


  $scope.hide = function(photo){
    socket.emit('vote', photo._id, 10);
    photo.hidden = true;
    photo.vote = 10;
    console.log('hide', photo);
  };

  $scope.rightClick = function(){
    $scope.selectedPhoto = null;
  };
  

}