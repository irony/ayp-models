function GroupsController($scope, $http){
  
  var zoomTimeout = null;
  $scope.selectedDate = new Date();
  $scope.zoomLevel = 50;
  $scope.photos = [];
  $scope.groups = [];

  $scope.counter = 0;


  $scope.loadMore = function(reset) {

    if (reset){
      $scope.counter = 0;
      $scope.photos = [];
      $scope.groups = [];
    }

    var query = {skip : $scope.counter, startDate: $scope.selectedDate.toISOString(), interestingness : $scope.zoomLevel, limit: 25};
    $http.get('/photoFeed', {params : query})
    .success(function(photos){

      if (photos)
      {
        var group = {photos: photos, id: photos[0]._id, name: photos[0].taken.split('T')[0] + " - " + photos[photos.length-1].taken.split('T')[0] };
        group.photo = photos.sort(function(a,b){
          return b.interestingness - a.interestingness;
        })[0];
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

  $scope.$watch('zoomLevel', function(value){
    
    clearTimeout(zoomTimeout);

    zoomTimeout = setTimeout(function(){
      $scope.loadMore(value);
    }, 100);

  });

  $scope.$watch('groups.length',function(){
    setTimeout(function(){
      var $spy = $(document.body).scrollspy('refresh');
    }, 100);
  });


}