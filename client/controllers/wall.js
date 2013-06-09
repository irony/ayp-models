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
    if (!waiting && $scope.photosInView) $scope.photoInCenter = $scope.photosInView.filter(function(a){return a.top >= $scope.scrollPosition + window.outerHeight / 2 - $scope.height / 2})[0];
  };

  $scope.dblclick = function(photo){
    $scope.photoInCenter = photo;
    $scope.zoomLevel += 3;
      $scope.selectedPhoto = photo;
  };

  $scope.select = function(photo){
    if (photo) $scope.photoInCenter = photo;
    $scope.selectedPhoto = photo;
  };


  $scope.$watch('fullscreen', function(value){
    console.log('fullscreen', window.innerWidth);
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
    photo.src = photo.src.replace('thumbnail', 'original').split('?')[0];
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
        return photo.top > $scope.scrollPosition - (delta < 0 && $scope.height * 2 || $scope.height) && photo.top < $scope.scrollPosition + window.innerHeight + (delta > 0 && $scope.height * 2 || $scope.height);
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


  /*

  document.addEventListener( 'keydown', function( e ) {
    var keyCode = e.keyCode || e.which,
        arrow = {left: 37, up: 38, right: 39, down: 40 },
        number = {
          zero  : 48,
          one   : 49,
          two   : 50,
          three : 51,
          four  : 52,
          five  : 53,
          six   : 54,
          seven : 55,
          eight : 56,
          nine  : 57
        };

    switch (keyCode) {
      case arrow.left:
        $('.selected').prev().click();
        e.preventDefault();
        
      break;
      case arrow.up:
        //..
      break;
      case arrow.right:
        $('.selected').next().click();
        e.preventDefault();

        
      break;
      case arrow.down:
        //..
      break;
      case number.zero : $scope.vote(0); break;
      case number.one : vote($('.selected')[0].id, 1); break;
      case number.two : vote($('.selected')[0].id, 2); break;
      case number.three : vote($('.selected')[0].id, 3); break;
      case number.four : vote($('.selected')[0].id, 4); break;
      case number.five : vote($('.selected')[0].id, 5); break;
      case number.sixe : vote($('.selected')[0].id, 6); break;
      case number.seven : vote($('.selected')[0].id, 7); break;
      case number.eight : vote($('.selected')[0].id, 8); break;
      case number.nine : vote($('.selected')[0].id, 9); break;
    }
  });
  
  */
  
}