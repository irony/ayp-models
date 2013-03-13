function GroupsController($scope, $http){
  
  var zoomTimeout = null;
  $scope.startDate = new Date();
  $scope.zoomLevel = 5;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;
  $scope.nrPhotos = undefined;

  $scope.scroll = function(){
    if ( $scope.loadingReverse) // reverse scroll, TODO: send as parameter instead
    {
      //var firstDate = $scope.groups[0].photos[$scope.groups[0].photos.length-1].taken;
      //if ($scope.groups.length && $scope.groups[0].photos) $scope.startDate = new Date(firstDate);
      // $scope.counter = 0;
    }
    return $scope.loadMore();
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
      window.stop(); // cancel all image downloads
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
/*
  $scope.$watch('photos', function(value){
    var groups = [],
        lastPhoto = null,
        group = null;

    value.forEach(function(photo){

      if (!lastPhoto || photo.taken.getTime() - lastPhoto.taken.getTime() > 24*60*60)
      {
        group = {photos : []};
        groups.push(group);
      }

      group.photos.push(photo);
      lastPhoto = photo;

    });
    console.log(groups);
    $scope.groups = groups;
  });*/

  $scope.$watch('zoomLevel + (stats && stats.all)', function(value, oldValue){
    
    if ($scope.zoomLevel > $scope.zoomLevel)
      $scope.startDate = new Date(); // reset the value when zooming out

    clearTimeout(zoomTimeout);

    $scope.nrPhotos = $scope.stats && $scope.stats.all * $scope.zoomLevel / 10 || $scope.photos.length;

    zoomTimeout = setTimeout(function(){
      $scope.loadMore($scope.startDate);
    }, 100);

  });

  $scope.$watch('groups.length',function(){
    setTimeout(function(){
      var $spy = $(document.body).scrollspy('refresh');
      $("ul.nav li").on("activate", function(elm)
      {
          $scope.startDate = new Date(elm.target.attributes['data-date'].value);
          document.location = '#' + $scope.startDate;
      });
    }, 100);
  });
  
  if (document.location.hash)
    $scope.startDate = new Date(document.location.hash.slice(1));
}