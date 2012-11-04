function PhotoController($scope, $http){
  $scope.photos = [];
  $scope.groups = {};
  $scope.dateRange = new Date();

  var counter = 0;
  $scope.loadMore = function() {
      console.log('loadMore', counter);

    var query = {skip : counter, limit: 400};
    $http.get('/photoFeed', query)
    .success(function(data){

      (data||[]).forEach(function(photo){
        photo.src='/img/thumbnails/' + photo.source + '/' + photo._id;
        photo.interesting = Math.random() * 100; // dummy value now. TODO: change to real one
        photo.class = "i" + Math.round(photo.interesting / 20);
        var group = $scope.getGroup(photo);
        group.push(photo);
      });

      console.log($scope.groups);
      $scope.photos.push.apply($scope.photos, data);
      counter += data.length;
    });
  };

  $scope.getGroup = function(photo){
    // group on date per default, TODO: add switch and control for this
    var groupName = photo.taken.split('T')[0],
        group = $scope.groups[groupName] = $scope.groups[groupName] || [];
    
    // split the groups if they are too big
    while(group.length > 20) {
      groupName = groupName + "_2";
      group = $scope.groups[groupName] = $scope.groups[groupName] || [];
    }

    return group;
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