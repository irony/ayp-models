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
    scrollTimeout = setTimeout(function(){
      $scope.photosInView = $scope.photos.filter(function(photo){
          return photo.top > $scope.scrollPosition - ($scope.loadingReverse && $scope.height * 2 || $scope.height) && photo.top < $scope.scrollPosition + 1900;
      });
      $scope.photoInCenter = $scope.photosInView[Math.floor($scope.photosInView.length * 0.75)];

    }, 100);
  };

  $scope.dblclick = function(photo){
    $scope.photoInCenter = photo;
    $scope.zoomLevel++;
  };

  $scope.$watch('zoomLevel', function(){
    if($scope.photoInCenter){
      var taken = $scope.photoInCenter;

      var newCenter = $scope.photos.slice().sort(function(a,b){return Math.abs(a.taken-taken) - Math.abs(b.taken-taken)})[0];
      $("html, body").animate({scrollTop: newCenter.top - 300 }, 500, function() {
        //location.hash = newCenter.taken;
      });
    }
  });


  $scope.$watch('zoomLevel + (library && library.photos.length)', function(value, oldValue){
    
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){
        var totalWidth = 0;
        var top = 0;
        var left = 0;
        var maxWidth = window.outerWidth * 1.2;
        var lastPhoto;
        $scope.height = $scope.zoomLevel > 8 && 60 ||
                        $scope.zoomLevel > 6 && 120 ||
                        $scope.zoomLevel < 2 && 480 ||
                        240;

        $scope.photos = ($scope.library.photos).filter(function(photo){
          if (photo && photo.src && photo.vote <= $scope.zoomLevel ) {
            photo.height = $scope.height;
            photo.width = photo.height * (photo.ratio || 1);
            totalWidth += photo.width;
            // var gap = lastPhoto && (lastPhoto.taken - photo.taken) > 24 * 60 * 60 * 1000;

            if (left + photo.width > maxWidth){
              top += photo.height + 5;
              photo.left = left = 0;
            } else {
              photo.left = left;
            }

            lastPhoto = photo;

            left += photo.width + 5;
            photo.top = top;
            return true;
          }
          return false;
        }, []);

        $scope.nrPhotos = $scope.photos.length || Math.round(($scope.stats && $scope.stats.all * $scope.zoomLevel / 10));

        // cancel all previous image requests
        // if (window.stop) window.stop();
        
        //$scope.photosInView = $scope.photos.slice(0,100);
        $scope.totalHeight = top + $scope.height;
        $scope.nrPhotos = $scope.photos.length;

      }, 50);
    }

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
  
  if (document.location.hash)
    $scope.startDate = new Date(document.location.hash.slice(1));

  $scope.scroll(); // initial databind
  
}