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
   
  $scope.scroll = function(){
    filterView();
  };

  $scope.dblclick = function(photo){
    document.location.hash.replace(photo.taken);
    $scope.photoInCenter = photo;
    $scope.zoomLevel++;
  };

  $scope.$watch('zoomLevel + (library && library.photos.length)', function(value, oldValue){
    
    
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
            if (photo === $scope.photoInCenter) $(document).scrollTop(photo.top);

            return true;
          }
          return false;
        }, []);

        $scope.nrPhotos = $scope.photos.length || Math.round(($scope.stats && $scope.stats.all * $scope.zoomLevel / 10));

        // cancel all previous image requests
        // if (window.stop) window.stop();
        
        //$scope.photosInView = $scope.photos.slice(0,100);
        $scope.totalHeight = top + $scope.height;
        filterView();

      }, 150);
    }
    filterView();
    $scope.$apply();

  });

  $scope.$watch('groups.length',function(){
    setTimeout(function(){
      var $spy = $(document.body).scrollspy('refresh');
      $("ul.nav li").on("activate", function(elm)
      {
          $scope.startDate = new Date(elm.target.attributes['data-date'].value);
          document.location.hash = '#' + $scope.startDate;
      });
    }, 100);
  });

  function filterView(){
    $scope.photosInView = $scope.photos.filter(function(photo){
        return photo.top > $scope.scrollPosition - ($scope.loadingReverse && $scope.height * 2 || $scope.height) && photo.top < $scope.scrollPosition + window.innerHeight + (!$scope.loadingReverse && $scope.height * 2 || $scope.height);
    });
    $scope.photoInCenter = $scope.photosInView.filter(function(a){return a.top >= $scope.scrollPosition-$scope.height})[0];
    findHash(); // initial load
  }
  
  function findHash(){
    if(document.location.hash && $scope.photos.length){
      var taken = parseInt(document.location.hash.slice(1), 10);

      var newCenter = null;
      $scope.photos.some(function(a){
        if (a.taken >= taken){
          newCenter = a;
          return a;
        }
        else return false;
      });

      if (newCenter) location.hash = newCenter.taken || "";
    }
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
      case number.zero : vote($('.selected')[0].id, 0); break;
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