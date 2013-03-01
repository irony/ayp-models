function GroupsController($scope, $http){
  
  var zoomTimeout = null;
  $scope.startDate = new Date();
  $scope.zoomLevel = 50;
  $scope.photos = [];
  $scope.groups = [];
  $scope.counter = 0;

  $scope.scroll = function(){
    if ( $scope.loadingReverse) // reverse scroll, TODO: send as parameter instead
    {
      var firstDate = $scope.groups[0].photos[$scope.groups[0].photos.length-1].taken;
      if ($scope.groups.length && $scope.groups[0].photos) $scope.startDate = new Date(firstDate);
      $scope.counter = 0;
    }
    return $scope.loadMore();
  };

  $scope.dblclick = function(photo){
    $scope.loadMore(photo.taken, $scope.zoomLevel+10, function(err){
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
    

    var query = {skip : $scope.counter, startDate: $scope.startDate.toISOString(), reverse : $scope.loadingReverse, vote : Math.floor( $scope.zoomLevel / 10), limit: 500};
    $http.get('/photoFeed', {params : query})
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
            group = {photos: photos, viewMode:'grid', id: photos[0].taken, range: stopDate + (startDate !== stopDate ? " - " + startDate : "")};

        group.tags = group.photos.map(function(photo){
          return photo.tags;
        }).reduce(function(a,b){return a.concat(b)}, []).reduce(function(a,b){
          var tag = a.filter(function(t){return t.tag === b})[0] || {tag:b, count:0};
          
          if (!tag.count)
            a.push(tag);

          tag.count++;
          return a;
        }, []).sort(function(a,b){return b.count - a.count}).map(function(tag){return tag.tag});

        group.photo = photos[photos.length-1]; // .sort(function(a,b){return b.interestingness - a.interestingness}).slice();
        group.name = group.tags.slice(0,2).join(' ');
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

  $scope.$watch('zoomLevel', function(value, oldValue){
    
    if (oldValue > value)
      $scope.startDate = new Date(); // reset the value when zooming out

    clearTimeout(zoomTimeout);

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