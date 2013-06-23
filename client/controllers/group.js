function GroupCtrl($scope){
  $scope.group = null;

  
  $scope.$watch('group', function(state){
    $scope.group.active = state;
    console.log($scope.group);

    if (state){
      $scope.photos.concat(group.photos);
    }

  }, true);
}