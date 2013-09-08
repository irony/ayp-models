var socket = io.connect();

// TODO: move to directive
var wall=document.getElementById("wall");

// decoration class - patch in a few methods on the photo object to directly control it's rendering on the page
// the reason we do it this way instead of the angular $scope.apply way is because of performance
function Photo(photo, $scope, $http, done){
  var image;
  var self = this;

  photo.vote = function(vote){
    console.log('vote', vote);
    socket.emit('vote', photo, vote);
  };

  photo.zoom = function(level){

    photo.zoom = level;

    if (!level){
      image.src = photo.src;
      photo.apply();
    }

    image.className="selected";

    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
      image.src = fullPhoto.store.original.url;
      $scope.focus = true;

      image.loaded = function(){
        $scope.loading = false;
        image.className="selected loaded";
      };
    });


    image.style.width = Math.round((window.innerHeight + 40) * photo.ratio) + "px";
    image.style.top = $(document).scrollTop() - 20 + "px"; // zoom in a little bit more - gives the wide screen a little more space to fill the screen
    image.style.left = Math.max(0,((parseInt(image.style.width))/2 - photo.width/2))  + "px";
    image.style.height = window.innerHeight + 40 + "px";
  };

  photo.render = function(){
    image = image || new Image();
    image.src = photo.src;
    image.id = photo._id;

    photo.started = true;

    image.onload = function(){
      wall.appendChild(image);
      photo.loaded = true;
      return done && done(); // let the image load attribute determine when the image is loaded
    };

    photo.apply(image);
    return image;
  };

  photo.apply = function(image){
    
    if (!image) image = document.getElementById(photo._id);

    image.style.top = photo.top + "px";
    image.style.left = photo.left + "px";
    image.style.width = photo.width + "px";
    image.style.height = photo.height + "px";
    image.className='v' + photo.vote + ' done ' + photo.class;
    return image;
  };
  
  photo.hide = function(){wall.removeChild(image)};
  
  photo.render();

  image.onclick = function(){
    $scope.click(photo);
  };

  return photo;
}

function PhotoController ($scope, $http, socket){
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
    $scope.photoInCenter = photo === $scope.photoInCenter ? null : $scope.photoInCenter;

    return !!$scope.photoInCenter;
  };

 
  $scope.hide = function(photo, group){
    console.log('hide', photo);
    socket.emit('hide', photo._id);
    photo.vote = 10;
  };


  socket.on('update', function(photos){
    console.log('update', photos);
    _.each(photos, function(photo){
      _.first($scope.photos, {_id : photo._id}, function(existing){
        _.assign(existing, photo);
      });
    });
  });

}