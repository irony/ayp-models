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

    }, 20);
  };

  $scope.dblclick = function(photo){
    $scope.loadMore(photo.taken, $scope.zoomLevel+1, function(err){
      document.location = '#' + photo.taken;
    });
  };

  $scope.loadMore = function(resetDate, zoomLevel, done) {


    if (resetDate){
      $scope.counter = 0;
      $scope.photos = [];
      $scope.endDate = null;
      $scope.startDate = new Date(resetDate);
      // window.stop(); // cancel all image downloads
      $scope.loading = false;
    }

    // prevent hammering
    if ($scope.loading) return;
    $scope.loading = true;


    if (zoomLevel) $scope.zoomLevel = Math.min(100, zoomLevel);
    

    var query = {skip : $scope.counter, startDate: $scope.startDate.toISOString(), reverse : $scope.loadingReverse, vote : $scope.zoomLevel + 1, limit: 100};
    $http.get('/api/photoFeed', {params : query})
    .success(function(photos){
      $scope.loading = false;

      if (photos.length)
      {
/*
        var averageDiff = photos.reduce(function(a,b){
          return {taken : b.taken, count : a.count++, sumDiff : (a.sumDiff || 0 ) + b.taken.getTime() - a.taken.getTime()};
        });

        averageDiff = averageDiff.sumDiff / averageDiff.count;
*/
        var startDate = photos[0].taken.split('T')[0],
            stopDate = photos[photos.length-1].taken.split('T')[0],
            group = {photos: photos, viewMode:'grid', id: photos[0].taken, range: (startDate !== stopDate ? startDate + " - ": "") + stopDate};

        // calculate the most popular tags in this group
        group.tags = group.photos.map(function(photo){
          return photo.tags;
        })
        // merge all tags to one array
        .reduce(function(a,b){return a.concat(b)}, [])
        // reduce them to a new struct with count and tag
        .reduce(function(a,b){
          b = b.trim(' ');

          var tag = a.filter(function(t){return t.tag === b})[0] || {tag:b, count:0};
          
          if (tag.count === 0)
            a.push(tag);

          tag.count++;
          return a;
        }, [])
        // get the most used tag
        .sort(function(a,b){return b.count - a.count})
        // take out the actual tags
        .map(function(tag){return tag.tag});

        group.photo = photos[0]; // .sort(function(a,b){return b.interestingness - a.interestingness}).slice();
        group.name = group.tags.slice(0,3).join(' ');

        if (resetDate) $scope.groups = [];
        
        if ($scope.loadingReverse) {
          $scope.groups.unshift(group);
        } else {
          $scope.groups.push(group);
        }

        $scope.counter += photos.length;

        if (done) done();

      }
    }).error(function(err){
      $scope.loading = false;
      $scope.loadingReverse = false;
      
      if (done) done(err);
      // alert somehow?
    });
  };

  $scope.$watch('zoomLevel + (library && library.photos.length)', function(value, oldValue){
    
    if ($scope.zoomLevel > $scope.zoomLevel)
      $scope.startDate = new Date(); // reset the value when zooming out

    $scope.nrPhotos = ($scope.stats && $scope.stats.all * $scope.zoomLevel / 10) || $scope.photos.length;
    
    if ($scope.zoomLevel && $scope.library && $scope.library.photos){
      clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(function(){
        var totalWidth = 0;
        var top = 0;
        var left = 0;
        var maxWidth = window.outerWidth * 1.2;
        $scope.photos = ($scope.library.photos).filter(function(photo){
          if (photo.vote <= $scope.zoomLevel ) {
            photo.height = 240;
            photo.width = photo.height * (photo.ratio || 1);
            totalWidth += photo.width;

            if (totalWidth % maxWidth < photo.width){
              top += photo.height;
              photo.left = left = 0;
            } else {
              photo.left = left;
              left += photo.width;
            }

            photo.top = top;
            return true;
          }
          return false;
        }, []);

        // cancel all previous image requests
        window.stop && window.stop();
        
        $scope.photosInView = $scope.photos.slice(0,100);
        $scope.totalHeight = top + 240;

        if($scope.photoInCenter){
          console.log($scope.photoInCenter)
          var newCenter = $scope.photos.slice().sort(function(a,b){return Math.abs(a.taken-$scope.photoInCenter.taken) - Math.abs(b.taken-$scope.photoInCenter.taken)})[0];
          console.log(newCenter)
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

  
}