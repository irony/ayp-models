function WallController($scope, $http){
  
  var zoomTimeout = null;
  var scrollTimeout = null;
  var utils = new Utils(_);
  var windowHeight = window.innerHeight;

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


  console.log('wall', $scope);

  var lastPosition = null;
  var waiting = false;
   
  $scope.scroll = function(){

    var delta = $scope.scrollPosition - lastPosition;
    $scope.scrolling = (Math.abs(delta) > 10);

    // if (Math.abs(delta) < windowHeight/ 2) return;


    filterView(delta);
    lastPosition = $scope.scrollPosition;
  };

  $scope.dblclick = function(photo){
    $scope.select(null);
    $scope.zoomLevel += 3;
  };

  $scope.select = function(photo){
    if (photo) {
      $scope.photoInCenter = photo;
    }

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
      old.class = 'done';

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
      $scope.loading = true;
      photo.loaded = function(){
        $scope.loading = false;
      };
    });

    photo.class="selected";
    photo.top = $(document).scrollTop() - 20; // zoom in a little bit more - gives the wide screen a little more space to fill the screen
    photo.height = window.innerHeight + 40;
    photo.width = Math.round(photo.height * photo.ratio);
    photo.left = Math.max(0,(window.innerWidth/2 - photo.width/2));

  });

  $scope.$watch('zoomLevel + (library && library.photos.length) + fullscreen', function(value, oldValue){
    
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
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

  function visible(photo, delta){
    return photo && photo.top > $scope.scrollPosition - (window.innerHeight * 2) && photo.top < $scope.scrollPosition + window.innerHeight * 2;
  }

  // by using a queue we can make sure we only prioritize loading images that are visible
  var loadQueue = async.queue(function(photo, done){
    if (photo.visible) return done(); // we already have this one
    photo.visible = visible(photo);
    if (!photo.visible) return done();
    return photo.loaded = function(){
      photo.loaded = null;
      photo.class = 'done';
      done(); // let the image load attribute determine when the image is loaded
    };
  }, 5);



  function filterView(delta){

    // if (Math.abs(delta) < windowHeight) return;

    // optimized filter instead of array.filter.
    var photosInView = [];
    var i = 0;
   
    while(i++ <  $scope.photos.length){
      var photo = $scope.photos[i];
      
      if (visible(photo, delta)) {
        photosInView.push(photo);
      } else{
        if (photosInView.length) break;
      }
    }

    photosInView = photosInView.sort(function(a,b){
      // take the center ones first but also prioritize the highest voted photos since they are more likely to be cached
      return $scope.photoInCenter && Math.abs($scope.photoInCenter.top - a.top) - Math.abs($scope.photoInCenter.top - b.top) || 0 - (a.vote - b.vote) * $scope.height;
    });

    utils.filterMerge($scope.photosInView, photosInView);

    var newImages = _.filter(photosInView, function(a){return !a.visible});

    loadQueue.tasks = [];
    loadQueue.unshift(newImages);
    
    if(!$scope.$$phase) $scope.$apply();

  }

  function saveGroup(photos){
    var visible = photos.filter(function(a){return a.active });
    var top = (visible.length && visible[0].top || 0); //+ 20;
    var last = visible.length && visible[visible.length-1] || null;

    //photos.forEach(function(photo){photo.top += 20});
    var group = {
      id : $scope.groups.length,
      photos: photos,
      top: top,
      height : last && (last.top + last.height - top) || 0,
      bottom : last && (last.top + last.height) || 0,
      from : photos[0].taken,
      to: top.taken,
      name : moment(photos[0].taken).format("dddd D MMM") //+ "(" + moment(photos.slice(-1).pop().taken).from(photos[0].taken, true) + ")"
    };

    $scope.groups.push(group);

    return group;
  }

  function closeRow(row, maxWidth){
    var last = row[row.length-1];
    var rowWidth = last.left + last.width;

    var percentageAdjustment = maxWidth / (rowWidth);

    // adjust height
    row.forEach(function(photo, i){
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
    var padding = 1;
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
      var gap = !nextPhoto && 1 || (photo.taken - nextPhoto.taken) / (6 * 60 * 60 * 1000);

      group.push(photo);
      
      // Only show visible photos
      if (photo && photo.src && photo.vote <= $scope.zoomLevel ) {

        photo.active = true;

        photo.height = height;
        photo.width = photo.height * (photo.ratio || 1);
        photo.top = top;
        photo.left = left + padding;
        row.push(lastPhoto = photo);

        // should we start a new row after this photo?
        if (photo.left + photo.width > maxWidth){
          closeRow(lastRow = row, maxWidth);
          row = [];
          top += photo.height + padding;
          left = padding;
        } else {
          left = photo.left + photo.width + padding;
        }

        // optimize - when we find the current row directly, just scroll to it directly
        if (!found && $scope.photoInCenter && photo.taken <= $scope.photoInCenter.taken && photo.top) {
          $('body,html').animate({scrollTop: photo.top - window.outerHeight / 2 - $scope.height}, 100);
          found = true;
        }
      } else{
        photo.active = false;
      }

      if (gap >= 1 ) {

        if (group.length >= 20){
          if (row.length > 2) {
            closeRow(row, maxWidth);
          }
          //else{
          //  lastRow.concat(row);
          //  closeRow(lastRow);
          //}

          var savedGroup = saveGroup(group);

          top = savedGroup.bottom + 15;
          left = 5;
        }
        group = [];
      }

      return photo.active;

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