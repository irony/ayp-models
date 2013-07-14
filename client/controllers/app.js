var loadTimeout;
var appProvider = angular.module('app', []);

function AppController($scope, $http, socket, library, storage)
{

  $scope.loading = false;

  $scope.stats = localStorage && localStorage.getObject('stats');


  setInterval(function(){
    $scope.stats = null; // reset and load new every 30 seconds
  }, 30000);

  $scope.$watch('stats', function(value){
    if (!value){
      console.log('loading stats');
      
      $http.get('/api/stats', {params: null}).success(function(stats){
        $scope.stats = stats;

        if ($scope.library && $scope.library.modified && $scope.stats.modified > $scope.library.modified)
        {
          library.loadLatest($scope.library.modified);
        }
      }).error(function(err){
        console.log('stats error');
      });
    }
  });


}


