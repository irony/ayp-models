function WallController($scope, $http){
  
  var zoomTimeout = null;
  var scrollTimeout = null;
  $scope.startDate = new Date();
  $scope.zoomLevel = 5;
  $scope.height = 240;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;
  $scope.nrPhotos = undefined;
  $scope.selectedPhoto = null;
  $scope.q = null;
  $scope.fullscreen = false;

  var lastPosition = null;
  var lastViewPosition = null;
  var waiting = false;
   
  $scope.scroll = function(){
    filterView($scope.scrollPosition - lastPosition);
    lastPosition = $scope.scrollPosition;
    if (!waiting && $scope.photosInView) $scope.photoInCenter = $scope.photosInView.filter(function(a){return a.top >= $scope.scrollPosition + window.outerHeight / 2 - $scope.height / 2}).sort(function(a,b){ return b.taken-a.taken })[0];
  };

  $scope.dblclick = function(photo){
    $scope.select(null);
    $scope.zoomLevel += 3;
  };

  $scope.select = function(photo){
    if (photo) $scope.photoInCenter = photo;
    $scope.selectedPhoto = photo;
  };

  $scope.$watch('photoInCenter', function(value){
    $scope.q = value && value.taken;
  });
/*
  $scope.$watch('q', function(value){
    //$scope.q = value.taken;
    if (value) findCenter(value && value.toDate().getTime());
  });
*/
  $scope.$watch('selectedPhoto', function(photo, old){

    if (old){
      if (old.original) {
        old.src = old.original.src;
        angular.copy(old.original, old);
      }
      old.src = old.src.replace('original', 'thumbnail').split('?')[0];

      delete old.original;
    }

    if (!photo) return;

    if (window.history.pushState) {
      window.history.pushState(photo, "Photo #" + photo._id, "#" + photo.taken);
    }
    photo.original = angular.copy(photo);

    $http.get('/api/photo/' + photo._id).success(function(fullPhoto){
      photo.meta = fullPhoto;
      console.log('full', fullPhoto);
      photo.src = fullPhoto.store.original.url;
    });

    photo.class="selected";
    photo.top = $(document).scrollTop();
    photo.height = window.innerHeight;
    photo.width = Math.round(photo.height * photo.ratio);
    photo.left = Math.max(0,(window.innerWidth/2 - photo.width/2));

  });

  $scope.$watch('zoomLevel + (library && library.photos.length) + fullscreen', function(value, oldValue){
    
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){

        // Recalculate all widths and heights in the current window size and vote level
        recalculateSizes();

        // Waiting is a semaphore for preventing the scoll method of
        // changing the scroll-position until we are done with our filtering.
        
        waiting = true;
        setTimeout(function(){
          filterView();
          waiting = false;
        }, 500);

      }, 300);
    }

  });

  function filterView(delta){
    if (delta && Math.abs(delta) > $scope.height) return;

    if (delta && Math.abs($scope.scrollPosition - lastViewPosition) < $scope.height) return;

    lastViewPosition = $scope.scrollPosition;

    $scope.photosInView = $scope.photos.filter(function(photo){
        return photo.top > $scope.scrollPosition - (delta < 0 && $scope.height * 5 || $scope.height * 2.5) && photo.top < $scope.scrollPosition + window.innerHeight + (delta > 0 && $scope.height * 5 || $scope.height);
    }).sort(function(a,b){
      return a.vote - b.vote;
    });
    if(!$scope.$$phase) $scope.$apply();
  }

  function recalculateSizes(){

    var totalWidth = 0;
    var top = 0;
    var left = 0;
    var maxWidth = window.innerWidth;
    var lastPhoto;
    $scope.height = $scope.zoomLevel > 8 && 120 ||
                    $scope.zoomLevel > 6 && 120 ||
                    $scope.zoomLevel < 2 && 480 ||
                    240;

    var row = [];
    var group = [];
    var groupNr = 0;
    var found = false;

    $scope.photos = ($scope.library.photos).filter(function(photo){
      var height = $scope.height;

      // calculate group
      var gap = lastPhoto && (lastPhoto.taken - photo.taken) / (8 * 60 * 60 * 1000);
      if (gap > 1 && group.length >= 6) {
        group = [];
        groupNr++;
      }

      lastPhoto = photo;
      group.push(photo);
      
      // filter out the photos in this view
      if (photo && photo.src && photo.vote <= $scope.zoomLevel ) {
        photo.height = $scope.height;
        photo.width = photo.height * (photo.ratio || 1);
        totalWidth += photo.width;

        // start new row
        if (left + photo.width > maxWidth){

          var percentageAdjustment = maxWidth / (left);
          if (true){
            // adjust height
            row.forEach(function(photo){
              photo.left *= percentageAdjustment;
              photo.width *= percentageAdjustment;
              photo.height *= percentageAdjustment;
            });

          } else {
            // center the row
            row.forEach(function(photo){
              photo.left += (window.outerWidth - left) / row.length;
            });
            percentageAdjustment = 1;
          }

          top += photo.height * percentageAdjustment + 5;
          photo.left = left = 0;
          row = [];
        } else {
          photo.left = left;
        }


        left += photo.width + 5;
        photo.top = top;

        row.push(photo);
        photo.groupNr = groupNr;


        // optimize - when we find the current row directly, just scroll to it directly
        if (!found && $scope.photoInCenter && photo.taken <= $scope.photoInCenter.taken) {
          $('body,html').animate({scrollTop: photo.top - window.outerHeight / 2 - $scope.height}, 100);
          found = true;
        }

        return true;
      }
      return false;
    }, []);

    $scope.nrPhotos = $scope.photos.length || Math.round(($scope.stats && $scope.stats.all * $scope.zoomLevel / 10));

    // cancel all previous image requests
    // if (window.stop) window.stop();
    
    //$scope.photosInView = $scope.photos.slice(0,100);
    $scope.totalHeight = top + $scope.height;
  }
  
  function findCenter(taken){


    var found = _.find($scope.photos, function(a){
      if (a.taken >= taken){
        taken = a;
        return a;
      }
      else return false;
    });

    if (taken) location.hash = found.taken || "";
  }

  filterView(); // initial view


  document.addEventListener( 'keyup', function( e ) {
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
    

    var current = $scope.photos.indexOf($scope.selectedPhoto);
    console.log('key', current, keys[keyCode], keyCode);

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
        e.preventDefault();
      break;
      case 'left':
        $scope.select(current > 0 ? $scope.photos[current -1 ] : null);
        $scope.$apply();
        e.preventDefault();
        
      break;
      case 'up':
        //..
      break;
      case 'right':
        $scope.select($scope.photos.length > current ? $scope.photos[current +1 ] : null);
        $scope.$apply();
        e.preventDefault();
      break;
      case 'down':
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