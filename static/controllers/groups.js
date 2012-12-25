function GroupsController($scope, $http){
  
  var zoomTimeout = null;
  $scope.groups = {};
  $scope.dateRange = new Date();
  $scope.lastDate = null;

  $scope.zoomLevel = 50;
  $scope.photos = []; 

  $scope.counter = 0;
  
  $scope.loadMore = function(zoomLevel) {

    if (zoomLevel){
      $scope.counter = 0;
      $scope.groups = {};
    }

    fetching = true;

    var query = {skip : $scope.counter, interestingness : zoomLevel || $scope.zoomLevel, limit: 40};
    $http.get('/groupFeed', {params : query})
    .success(function(groups){

      for(var groupKey in groups){
        $scope.groups[groupKey] = $scope.groups[groupKey] || {};
        $scope.groups[groupKey].name = groupKey;
        var photos = $scope.groups[groupKey].photos = $scope.groups[groupKey].photos || {};
        if (!photos[groupKey]){
          for(var photoKey in groups[groupKey])
          {
              photos[photoKey] = groups[groupKey][photoKey];
          };
        }
      }
          console.log($scope.groups);
    });


  };

  var timeout = null;

  $scope.$watch('zoomLevel', function(value){
    
    clearTimeout(timeout);

    timeout = setTimeout(function(){
      $scope.loadMore(value);
    }, 100);

  });


}