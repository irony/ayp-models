var loadTimeout;
var appScope;

function AppController($scope, $http)
{
  var socket = io.connect();

  $scope.loadMore = null;
  $scope.loading = false;
  $scope.loadingReverse = false;
  $scope.scrollPercentage = 0;
  $scope.scrollPosition = 0;

  appScope = $scope;
  $scope.stats = localStorage && localStorage.getObject('stats');

  setInterval(function(){
    $scope.stats = null; // reset and load new every 30 seconds
  }, 30000);


  socket.on('connect', function(data){
    console.log('connect');
    socket.on('trigger', function(trigger){
      console.log('trigger', trigger);

      var photo = $scope.library.photos.filter(function (item) {
        return item.taken === new Date(trigger.item.taken).getTime();
      }).pop();

      if (photo){
        angular.extend(photo, trigger.item); // update existing
      }
      else{
        $scope.library.photos.push(trigger.item); // add
      }


    });
  });

  $scope.$watch('scrollPosition', function(value){

    // force reload check when scrolling to top.
    // if (value < 0 && !$scope.stats) $scope.stats = null;

  });

  $scope.$watch('stats', function(value){
    if (!value){
      console.log('loading stats');
      
      $http.get('/api/stats', {params: null}).success(function(stats){
        $scope.stats = stats;

        if ($scope.library && $scope.library.modified && $scope.stats.modified > $scope.library.modified)
        {
          loadLatest($scope.library.modified);
        }
      }).error(function(err){
        console.log('stats error');
      });
    }
  });


}



Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}