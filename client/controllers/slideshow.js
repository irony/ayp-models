
function SlideshowController ($scope, $http){
  $scope.group = undefined;
  this.setModel = function(data) {
    $scope.$apply( function() {
       $scope.data = data;
    });
  };
  $scope.setModel = this.setModel;
}
