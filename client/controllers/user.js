function LoginController($http, $scope){
  $scope.register = undefined;
  $scope.agree = false;
  $scope.username = undefined;
  $scope.password = undefined;

  $scope.$watch('username', function(val){
    if (val && val.indexOf('@') && val.length > 4){
      $http.get('/api/user/exist', {params: {q:val}})
      .success(function(result){
        $scope.register = !JSON.parse(result);
      });
    }
  });

}