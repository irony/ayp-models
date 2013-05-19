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

        $scope.photos = ($scope.library.photos).filter(function(photo){
          if (photo && photo.src && photo.vote <= $scope.zoomLevel ) {
            photo.height = $scope.height;
            photo.width = photo.height * (photo.ratio || 1);
            totalWidth += photo.width;
            // var gap = lastPhoto && (lastPhoto.taken - photo.taken) / ($scope.zoomLevel * 1000) || 5; //> 24 * 60 * 60 * 1000;

            if (left + photo.width > maxWidth){
              top += photo.height + 5;
              photo.left = left = 0;
            } else {
              photo.left = left;
            }

            lastPhoto = photo;

            left += photo.width + 5;
            photo.top = top;

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
    $scope.$apply();
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

  
}