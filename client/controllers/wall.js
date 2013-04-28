function WallController($scope, $http){
  
  var zoomTimeout = null;
  var scrollTimeout = null;
  $scope.startDate = new Date();
  $scope.zoomLevel = 5;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;
  $scope.nrPhotos = undefined;

  $scope.scroll = function(){
    scrollTimeout = setTimeout(function(){
      $scope.photosInView = $scope.photos.filter(function(photo){
          return photo.top > $scope.scrollPosition - 250 && photo.top < $scope.scrollPosition + 1900;
      });
      $scope.photoInCenter = $scope.photosInView[Math.floor($scope.photosInView.length * 0.75)];

    }, 100);
  };

  $scope.dblclick = function(photo){
    $scope.photoInCenter = photo;
    $scope.zoomLevel++;
  };


  $scope.$watch('zoomLevel + (library && library.photos.length)', function(value, oldValue){
    
    if ($scope.zoomLevel > $scope.zoomLevel)
      $scope.startDate = new Date(); // reset the value when zooming out

    $scope.nrPhotos = $scope.photos.length || ($scope.stats && $scope.stats.all * $scope.zoomLevel / 10);
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){
        var totalWidth = 0;
        var top = 0;
        var left = 0;
        var maxWidth = window.outerWidth * 1.2;
        var lastPhoto;

        $scope.photos = ($scope.library.photos).filter(function(photo){
          if (photo.vote <= $scope.zoomLevel ) {
            photo.height = 240;
            photo.width = photo.height * (photo.ratio || 1);
            totalWidth += photo.width;
            var gap = lastPhoto && (lastPhoto.taken - photo.taken) > 24 * 60 * 60 * 1000;

            if (left + photo.width > maxWidth || gap){
              top += photo.height;
              photo.left = left = 0;
            } else {
              photo.left = left;
              left += photo.width;
            }

            lastPhoto = photo;

            photo.top = top;
            return true;
          }
          return false;
        }, []);

        // cancel all previous image requests
        // if (window.stop) window.stop();
        
        $scope.photosInView = $scope.photos.slice(0,100);
        $scope.totalHeight = top + 240;
        $scope.nrPhotos = $scope.photos.length;

        if($scope.photoInCenter){
          var newCenter = $scope.photos.slice().sort(function(a,b){return Math.abs(a.taken-$scope.photoInCenter.taken) - Math.abs(b.taken-$scope.photoInCenter.taken)})[0];
          $("html, body").animate({scrollTop: newCenter.top - 300 }, 100, function() {
            location.hash = newCenter.taken;
          });
        }
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