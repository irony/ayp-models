

function WallController($scope, $http, $window, library, socket, Group){
  
  var zoomTimeout = null;
  var scrollTimeout = null;
  var windowHeight = window.innerHeight;
  var windowWidth = window.innerWidth;

  $scope.startDate = new Date();
  $scope.zoomLevel = 5;
  $scope.height = 240;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;
  $scope.nrPhotos = undefined;
  $scope.photosInView = [];
  $scope.selectedPhoto = null;
  $scope.q = null;
  $scope.fullscreen = false;
  $scope.loading = true;

  library.init();

  var lastPosition = null;
  var waiting = false;

  $window.onresize = function(event) {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
  };
   
  $window.onscroll = function(event) {

    $scope.loadingReverse = $(window).scrollTop() < 0;
    $scope.scrollPosition = $(window).scrollTop();
    $scope.scrollCenter = $scope.scrollPosition + window.outerHeight / 2;

    var delta = $scope.scrollPosition - lastPosition;

    if ($scope.selectedPhoto)
    {
      if (Math.abs($scope.scrollPosition - $scope.selectedPhoto.top) > $scope.selectedPhoto.height * (1+$scope.selectedPhoto.zoomLevel))
        $scope.select(null);
    }

    $scope.scrolling = (Math.abs(delta) > 50);

    filterView(delta);

    // if (!waiting && $scope.photosInView) $scope.photoInCenter = _.filter($scope.photosInView, function(a){return a.top >= $scope.scrollPosition + window.outerHeight / 2 - $scope.height / 2}).sort(function(a,b){ return b.taken-a.taken })[0];

    lastPosition = $scope.scrollPosition;

  };


  $scope.click = function(photo){

    if ($scope.selectedPhoto === photo){
      clearTimeout(photo.updateClick);
      $scope.select(null);
    }
    else {
      $scope.select(photo);
      photo.updateClick = setTimeout(function(){
        console.log('click', photo);
        socket.emit('click', photo, 1);
      }, 300);
    }

  };

  $scope.dblclick = function(photo){
    $scope.select(null);
    $scope.zoomLevel += 3;
/*
    var index=$scope.library.photos.indexOf(photo);

    $scope.library.photos.slice(index, index + 10).map(function(photo){
      photo.vote = 0;
    });

    recalculateSizes();*/

  };

  $scope.select = function(photo){
    if (photo) {
      $scope.photoInCenter = photo;
    }

    $scope.selectedPhoto = photo;
    $scope.$apply();
  };


  $scope.$watch('stats', function(value){
    if ($scope.stats && $scope.stats.all && !$scope.totalHeight) $scope.totalHeight = $scope.height * $scope.stats.all / 5; // default to a height based on the known amount of images
  });
/*
  $scope.$watch('photoInCenter', function(photo){
    if (!photo) return;

    photo.class="flip";

    $scope.q = photo && photo.taken;
    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
    });

    $scope.$apply();
    photo.apply();

  });*/

  $scope.$watch('selectedPhoto', function(photo, old){

    if (old && old.zoomLevel) {
      old.zoom(null);
    }

    if (!photo){
      $scope.focus = false;
      return;
    }

    if (window.history.pushState) {
      window.history.pushState(photo.taken, "Photo #" + photo._id, "#" + photo.taken);
    }

    photo.zoom(1);

  });

  library.listeners.push(function(photos){

    $scope.groups = (photos || []).reduce(function(groups, photo, i){

      var group = groups.slice(-1)[0];
      var lastPhoto = group && group.photos.slice(-1)[0];

      if (!group || (lastPhoto && lastPhoto.cluster && photo.cluster && photo.cluster.split('.')[0] !== lastPhoto.cluster.split('.')[0])) {
        group = new Group();
        groups.push(group);
      }
      group.photos.push(photo);
      return groups;
    }, []);
        
    recalculateSizes();
    filterView();
  });
  

  $scope.$watch('zoomLevel + fullscreen', function(value, oldValue){
    
    
    if ($scope.zoomLevel){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){
        
        $scope.loading = true;

        // Recalculate all widths and heights in the current window size and vote level
        recalculateSizes();
        
        if(!$scope.$$phase) $scope.$apply();

        // Waiting is a semaphore for preventing the scoll method of
        // changing the scroll-position until we are done with our filtering.
        
        waiting = true;
        setTimeout(function(){
          filterView();
          waiting = false;
          $scope.loading = false;
          $scope.scrolling = false;

        }, 500);

      }, 300);
    }

  });

  $scope.$watch('activeGroup', function(group){
    if (group) $('body,html').animate({scrollTop: group.top}, 300);
  });

  function isInViewPort(top){
    
    return top > $scope.scrollPosition - (windowHeight) && top < $scope.scrollPosition + windowHeight * 3;
  }

  function visible(photo){
    return photo && photo.active && isInViewPort(photo.top) || photo && isInViewPort(photo.top + photo.height);
  }

  

  // by using a queue we can make sure we only prioritize loading images that are visible
  var loadQueue = async.queue(function(photo, done){
    if (!photo) return done(); // should never happen..
    if (!visible(photo)) return done(); // this isn't visible anymore we will not continue to load it
    if (photo.loaded) return done(photo.apply()); // we already have this one, just update with new dimensions

    return new Photo(photo, $scope, $http, done);

  }, 7);

  loadQueue.drain = function(){
    console.log('all loaded');
  };


  function filterView(delta){

    $scope.scrolling = false;

    $scope.photosInView = $scope.groups.reduce(function(visiblePhotos, group){
      
      if (isInViewPort(group.top) || isInViewPort(group.bottom) || (group.top <= $scope.scrollPosition && group.bottom >= $scope.scrollPosition)){
        group.photos.forEach(function(photo){
          if (photo.active) visiblePhotos.push(photo);
        });
      }
      return visiblePhotos;
    }, []).sort(function(a,b){
      //return (a.vote - b.vote);
      return -(Math.abs(b.top - $scope.scrollCenter) - Math.abs(a.top - $scope.scrollCenter)); // + (0- (a.vote - b.vote) * $scope.height;
    });

    $scope.photoInCenter = $scope.photosInView;

    // remove photos that have already been started before
    var photos = $scope.photosInView.filter(function(photo){
      return !photo.started;
    });

    // abort all active queued images in queue except for those that have started
    loadQueue.tasks = loadQueue.tasks.filter(function(photo){
      return photo.started;
    });

    // add new photos first
    loadQueue.unshift(photos);

    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }


  function recalculateSizes(){

    $scope.height = $scope.zoomLevel > 8 && 110 ||
                    $scope.zoomLevel > 6 && 120 ||
                    $scope.zoomLevel < 2 && 480 ||
                    240;

    // compensate for bigger / smaller screens
    $scope.height = Math.floor($scope.height * (window.innerWidth / 1920));
    $scope.totalHeight = $scope.groups.reduce(function(top, group){
      var left = 5; //lastGroup && lastGroup.right + 5 || 0;
      group.bind(top, left, $scope.height, $scope.zoomLevel);
      return (group.bottom || top) + 5;
    }, 100);
    $scope.totalWidth = window.innerWidth;

    $scope.nrPhotos = $scope.groups.reduce(function(sum, group){return sum + group.visible}, 0);
  }



  document.addEventListener( 'keydown', function( e ) {
    var keyCode = e.keyCode || e.which,
        keys = {
          27: 'esc',
          32: 'space',
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
          48: 'zero',
          49: 'one',
          50: 'two',
          51: 'three',
          52: 'four',
          53: 'five',
          54: 'six',
          55: 'seven',
          56: 'eight',
          57: 'nine'
        };
    

    var current = $scope.photosInView.sort(function(a,b){return b.taken - a.taken}).indexOf($scope.selectedPhoto);

    switch (keys[keyCode]) {
      case 'space' :
        if ($scope.selectedPhoto)
          $scope.select(null);
        else
          $scope.select($scope.photoInCenter);

        $scope.$apply();
        e.preventDefault();
      break;

      case 'esc' :
        $scope.select(null);
        $scope.$apply();
        // e.preventDefault();
      break;
      case 'left':
        $scope.select(current > 0 ? $scope.photosInView[current -1 ] : null);
        e.preventDefault();
        
      break;
      case 'right':
        $scope.select($scope.photosInView.length > current ? $scope.photosInView[current +1 ] : null);
        e.preventDefault();
      break;
      case 'up':
        if ($scope.selectedPhoto){
          $scope.selectedPhoto.zoomLevel++;
          $scope.selectedPhoto.zoom($scope.selectedPhoto.zoomLevel);
          e.preventDefault();
        }
        //..
      break;
      case 'down':
        if ($scope.selectedPhoto){
          
          $scope.selectedPhoto.zoomLevel--;
          $scope.selectedPhoto.zoom($scope.selectedPhoto.zoomLevel);
          
          if(!$scope.selectedPhoto.zoomLevel) $scope.select(null);
          
          e.preventDefault();
        }
        //..
      break;
      case 'zero' : $scope.vote(0); break;
      case 'one' : vote($('.selected')[0].id, 1); break;
      case 'two' : vote($('.selected')[0].id, 2); break;
      case 'three' : vote($('.selected')[0].id, 3); break;
      case 'four' : vote($('.selected')[0].id, 4); break;
      case 'five' : vote($('.selected')[0].id, 5); break;
      case 'sixe' : vote($('.selected')[0].id, 6); break;
      case 'seven' : vote($('.selected')[0].id, 7); break;
      case 'eight' : vote($('.selected')[0].id, 8); break;
      case 'nine' : vote($('.selected')[0].id, 9); break;
    }
  });
  
}