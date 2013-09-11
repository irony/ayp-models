var socket = io.connect();

// TODO: move to directive
var wall=document.getElementById("wall");

// decorator class - patch in a few methods on the photo object to directly control it's rendering on the page
// the reason we do it this way instead of the angular $scope.apply way is because of performance
function Photo(photo, $scope, $http, done){
  var image;
  var self = this;

  photo.updateVote = function(vote){
    console.log('vote', vote);
    socket.emit('vote', photo, vote);
  };

  photo.zoom = function(level){

    photo.zoomLevel = level;

    if (!level){
      image.src = photo.src;
      photo.apply();
      return;
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

    var fullWidth = Math.round((window.innerHeight + 40) * photo.ratio);

    var style = {
      width : fullWidth + "px",
      top : $(document).scrollTop() - 20 + "px", // zoom in a little bit more - gives the wide screen a little more space to fill the screen
      left : (window.innerWidth)/2 - fullWidth/2 + "px",
      height : window.innerHeight + 40 + "px"
    };
    $(image).css(style); // apply all styles at once
    image.style.transform.scale = level;
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
    
    if (!image) image = document.getElementById(photo._id) || photo.render();

    var style = {
      top : Math.round(photo.top) + "px",
      left : Math.round(photo.left) + "px",
      width : Math.round(photo.width) + "px",
      height : Math.round(photo.height) + "px"
    };
    $(image).css(style); // apply all styles at once to prevent flickering

    image.className='v' + photo.vote + ' done ' + photo.class;


    return image;
  };
  
  photo.hide = function(){
    if (photo.loaded){
      wall.removeChild(image);
      photo.loaded = false;
    }
  };
  
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