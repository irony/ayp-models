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


  console.log('wall', $scope);

  var lastPosition = null;
  var waiting = false;
   
  $scope.scroll = function(){
    var delta = $scope.scrollPosition - lastPosition;
    if (Math.abs(delta) < window.innerHeight) return;

    console.log(delta);

    filterView(delta);
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



  $scope.$watch('stats', function(value){
    if ($scope.stats && $scope.stats.all && !$scope.totalHeight) $scope.totalHeight = $scope.height * $scope.stats.all / 5; // default to a height based on the known amount of images
  });

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

  function visible(photo, delta){
    return photo && photo.top > $scope.scrollPosition - (window.innerHeight) && photo.top < $scope.scrollPosition + window.innerHeight * 2;
  }

  function filterView(delta){


    // optimized filter instead of array.filter.
    var photosInView = [];
    var i = 0;
   
    while(i++ <  $scope.photos.length){
      var photo = $scope.photos[i];
      
      if (visible(photo)) {
        photosInView.push(photo);
      } else{
        if (photosInView.length) break;
      }
    }

    $scope.photosInView = photosInView.sort(function(a,b){
      // take the center ones first but also prioritize the highest voted photos since they are more likely to be cached
      return $scope.photoInCenter && Math.abs($scope.photoInCenter.top - a.top) - Math.abs($scope.photoInCenter.top - b.top) || 0 - (a.vote - b.vote) * $scope.height;
    });


    async.mapLimit($scope.photosInView, 5, function(photo, done){
      if (photo.visible) return done(); // we already have this one

      photo.visible = visible(photo);
      if (!photo.visible) return done();
      return photo.loaded = function(){
        photo.loaded = null;
        photo.class = 'done';
        done(); // let the image load attribute determine when the image is loaded
      };
    }, function(){
      // page done
    });

    if(!$scope.$$phase) $scope.$apply();
  }

  function saveGroup(group){
    var visible = group.filter(function(a){return a.top});
    var top = visible.length && visible[0].top || 0;
    var last = visible.length && visible.slice(-1).pop() || null;

    $scope.groups.push({
      photos: group,
      top: top,
      height : last && last.top + last.height - top || 0
    });

    visible.forEach(function(groupPhoto){
      groupPhoto.left += 15;
    });

  }

  function closeRow(row, maxWidth){
    var last = row[row.length-1];
    var rowWidth = last.left + last.width;

    var percentageAdjustment = maxWidth / (rowWidth);
    // adjust height
    row.forEach(function(photo){
      photo.left *= percentageAdjustment;
      photo.width *= percentageAdjustment;
      photo.height *= percentageAdjustment;
    });
  }

  function recalculateSizes(){

    $scope.height = $scope.zoomLevel > 8 && 110 ||
                    $scope.zoomLevel > 6 && 120 ||
                    $scope.zoomLevel < 2 && 480 ||
                    240;

    $scope.groups = [];

    // compensate for bigger / smaller screens
    $scope.height = $scope.height * (window.innerWidth / 1920);

    var row = [];
    var group = [];
    var height = $scope.height;
    var maxWidth = window.innerWidth;
    var found = false;
    var lastRow = null;
    var lastPhoto = null;
    var top = 0;
    var left = 0;

    // go through all photos
    // add all to groups
    // add visible to rows
    // only keep groups with enough photos in them
    // compensate width on each row

    // we want to go through all photos even if they are invisible
    $scope.photos = ($scope.library.photos).filter(function(photo, i, photos){

      // Is this the last in its group?
      var nextPhoto = photos[i+1];
      var gap = !nextPhoto || (nextPhoto.taken - photo.taken) / (8 * 60 * 60 * 1000);

      group.push(photo);
      
      // Only show visible photos
      if (photo && photo.src && photo.vote <= $scope.zoomLevel ) {

        photo.height = height;
        photo.width = photo.height * (photo.ratio || 1);
        photo.top = top + 5;
        photo.left = left + 5;
        row.push(lastPhoto = photo);

        // should we start a new row after this photo?
        if (photo.left + photo.width > maxWidth){

          closeRow(lastRow = row, maxWidth);
          row = [];
          top += photo.height;
          left = 0;

        } else {
          left = photo.left + photo.width;
        }

        if (gap) {

          if (group.length >= 20){
            saveGroup(group);
          }
          group = [];
        }


        // optimize - when we find the current row directly, just scroll to it directly
        if (!found && $scope.photoInCenter && photo.taken <= $scope.photoInCenter.taken && photo.top) {
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