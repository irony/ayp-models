function ShareController($scope, $http){
  $scope.email = "";
  $scope.photos = [];
  $scope.dateRange = [];
  $scope.fromDate = undefined;
  $scope.toDate = undefined;

  $scope.toggle = true;

  $scope.$watch('fromDate+toDate', function() {
    $scope.dateRange = $scope.fromDate + " - " + $scope.toDate;
  });

  $scope.$watch('defaultDateRange', function(value){
    $scope.dateRange = value;
  });

  $scope.select = function(photo){
    
    if ($scope.toggle = !$scope.toggle) {
      $scope.fromDate = photo.taken; //.replace('T', ' ').split('.')[0];
    } else {
      $scope.toDate = photo.taken; //.replace('T', ' ').split('.')[0];
    }

  };

  $scope.reset = function()
  {
    $scope.toggle = true;
    $scope.dateRange = $scope.defaultDateRange;
  };

  $scope.$watch('dateRange', function(newVal) {
    var query = {email : $scope.email.toString(), dateRange : $scope.dateRange.toString()};
    console.log(query);
    $http.post('/api/photoRange', query)
    .success(function(data){
      console.log(data);
      $scope.photos = data;
    });
  });
}