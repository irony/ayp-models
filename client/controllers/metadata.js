function MetadataCtrl($scope){
  
  $scope.star = function(photo){
    socket.emit('star', photo._id);
    photo.starred = !photo.starred;
    console.log('star', photo);
    photo.vote = 0;
  };


  $scope.hide = function(photo){
    socket.emit('hide', photo._id);
    photo.hidden = true;
    photo.vote = 10;
    console.log('hide', photo);
  };

  $scope.rightClick = function(){
    $scope.selectedPhoto = null;
  };
  

}