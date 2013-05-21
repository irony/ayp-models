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
  var lastPosition = null;
  var lastViewPosition = null;
  var waiting = false;
   
  $scope.scroll = function(){
    filterView($scope.scrollPosition - lastPosition);
    lastPosition = $scope.scrollPosition;
    if (!waiting && $scope.photosInView) $scope.photoInCenter = $scope.photosInView.filter(function(a){return a.top >= $scope.scrollPosition+$scope.height})[0];
  };

  $scope.dblclick = function(photo){
    document.location.hash.replace(photo.taken);
    $scope.photoInCenter = photo;
    $scope.zoomLevel++;
  };

  $scope.$watch('zoomLevel + (library && library.photos.length) + window.outerWidth', function(value, oldValue){
    
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){


        var totalWidth = 0;
        var top = 0;
        var left = 0;
        var maxWidth = window.outerWidth * 1.2;
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

              // center the row
              row.forEach(function(photo){
                photo.left += (window.outerWidth - left) / row.length;
              });

              top += photo.height + 5;
              photo.left = left = 0;
              row = [];
            } else {
              photo.left = left;
            }


            left += photo.width + 5;
            photo.top = top;

            row.push(photo);
            photo.groupNr = groupNr;


            // optimize - if we find the current row directly, just scroll to it directly
            if (!found && $scope.photoInCenter && photo.taken <= $scope.photoInCenter.taken) {
              $('body,html').animate({scrollTop: photo.top}, 300);
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
        waiting = true;
        filterView();
        $scope.$apply();

        setTimeout(function(){
          waiting = false;
        }, 1000);

      }, 300);
    }

  });

  function filterView(delta){
    if (delta && Math.abs(delta) > $scope.height) return;

    if (delta && Math.abs($scope.scrollPosition - lastViewPosition) < $scope.height) return;

    lastViewPosition = $scope.scrollPosition;

    $scope.photosInView = $scope.photos.filter(function(photo){
        return photo.top > $scope.scrollPosition - (delta < 0 && $scope.height * 2 || $scope.height) && photo.top < $scope.scrollPosition + window.innerHeight + (delta > 0 && $scope.height * 2 || $scope.height);
    });


  }
  
  function findCenter(center){
    var taken = center && center.taken || $scope.photoInCenter.taken;
    if (!$('#' + taken))

    $scope.photos.some(function(a){
      if (a.taken >= taken){
        taken = a;
        return true;
      }
      else return false;
    });

    if (taken) location.hash = taken || "";
  }



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
  
}