function PhotoController($scope, $http){
  $scope.photos = [];
  $scope.dateRange = new Date();

  var counter = 0;
  $scope.loadMore = function() {
      console.log('loadMore', counter);

    var query = {skip : counter};
    $http.get('/photoFeed', query)
    .success(function(data){
      
      (data||[]).forEach(function(photo){
        photo.src='/img/thumbnails/' + photo.source + '/' + photo._id;
      });
      


      $scope.photos.push.apply($scope.photos, data);
      counter += data.length;
    });
  };

  $scope.loadMore();
}

angular.module('scroll', []).directive('whenScrolled', function() {
  console.log('scroll', elm);
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});