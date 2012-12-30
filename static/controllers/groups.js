function GroupsController($scope, $http){
  
  var zoomTimeout = null;
  $scope.startDate = new Date();
  $scope.zoomLevel = 50;
  $scope.photos = [];
  $scope.groups = [];

  $scope.counter = 0;


  $scope.loadMore = function(resetDate, zoomLevel) {

    if (resetDate){
      $scope.counter = 0;
      $scope.photos = [];
      $scope.startDate = new Date(resetDate);
    }
    if (zoomLevel) $scope.zoomLevel = Math.min(100, zoomLevel);
    

    var query = {skip : $scope.counter, startDate: $scope.startDate.toISOString(), interestingness : $scope.zoomLevel, limit: 25};
    $http.get('/photoFeed', {params : query})
    .success(function(photos){

      if (photos)
      {

/*
        var averageDiff = photos.reduce(function(a,b){
          return {taken : b.taken, count : a.count++, sumDiff : (a.sumDiff || 0 ) + b.taken.getTime() - a.taken.getTime()};
        });

        averageDiff = averageDiff.sumDiff / averageDiff.count;
*/
        var startDate = photos[0].taken.split('T')[0],
            stopDate = photos[photos.length-1].taken.split('T')[0],
            group = {photos: photos, id: photos[0]._id, name: stopDate + (startDate !== stopDate ? " - " + startDate : "")};


        group.photo = photos[0];

        if (resetDate) $scope.groups = [];
        
        $scope.groups.push(group);
        $scope.counter += photos.length;
      }

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
          console.log(elm.target.attributes['data-date'].value);
      });
    }, 100);
  });


}