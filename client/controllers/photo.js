
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
    var card = document.createElement('div');
    var meta = document.createElement('div');
    angular.copy(event.target.style, meta.style);
    meta.class = 'meta flip';
    meta.innerHTML= 'metadata goes here';

    event.target.parentNode.appendChild(card);
    card.appendChild(event.target);
    card.appendChild(meta);

    card.class = 'flip';
    console.log(card);
  };

  $scope.click = function(photo){


      var target = event.target;
      $scope.photoInCenter = photo;
      document.location.hash.replace(photo.taken); // save the current focused one so we can find it later
      
      // we already have a selected photo, lets restore that first
      if ($scope.selectedPhoto) {
        angular.copy($scope.selectedPhoto.original, $scope.selectedPhoto);
        delete $scope.selectedPhoto.original;
        if ($scope.selectedPhoto._id === photo._id) return;
        $scope.selectedPhoto = null;
      }

      //document.location.hash = photo.taken;
      
      // store the original values so we can restore them all easily later
      photo.original = angular.copy(photo);
      console.log(photo)
      $scope.selectedPhoto = photo;

      photo.src = photo.src.replace('thumbnail', 'original');
      photo.class="selected";
      photo.top = $(document).scrollTop();
      photo.height = window.innerHeight;
      photo.width = Math.round(photo.height * photo.ratio);
      photo.left = Math.max(0,(window.innerWidth/2 - photo.width/2));

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

  $scope.star = function(photo){
    socket.emit('star', photo._id);
    photo.starred = !photo.starred;
    console.log('star', photo);
  };


  $scope.starClass = function(photo){
    return photo && photo.starred ? "icon-heart" : "icon-heart-empty";
  };
}