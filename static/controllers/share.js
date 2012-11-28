function ShareController($scope, $http){
  $scope.email = "";
  $scope.photos = [];
  $scope.dateRange = [];
  $scope.fromDate = undefined;
  $scope.toDate = undefined;

  $scope.$watch('fromDate+toDate', function() {
    $scope.dateRange = $scope.fromDate + " - " + $scope.toDate;
  });

  $scope.$watch('dateRange', function(newVal) {
    var query = {email : $scope.email.toString(), dateRange : $scope.dateRange.toString()};
    console.log(query);
    $http.post('/photoRange', query)
    .success(function(data){
      console.log(data);
      $scope.photos = data;
    });
  });
}