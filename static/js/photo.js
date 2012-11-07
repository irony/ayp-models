function PhotoController($scope, $http){
  
  var zoomTimeout = null;

  $scope.photos = [];
  $scope.groups = {};
  $scope.dateRange = new Date();

  $scope.zoomLevel = 50;

  var counter = 0;
  $scope.loadMore = function() {
      console.log('loadMore', counter);

    var query = {skip : counter, limit: 50};
    $http.get('/photoFeed', query)
    .success(function(data){

      (data||[]).forEach(function(photo){
        photo.src='/img/thumbnails/' + photo.source + '/' + photo._id;
        photo.interesting = Math.random() * 100; // dummy value now. TODO: change to real one
        photo.class = "span3";
      });

      $scope.photos.push.apply($scope.photos, data);
      counter += data.length;
      $scope.recalulateGroups($scope.photos);
    });
  };

  $scope.recalulateGroups = function(photos){
      var groups = {};
      if (photos.length > 0){
        (photos||[]).forEach(function(photo){
          var group = getGroup(groups, photo);
          group.photos.push(photo);
        });
        
        angular.forEach(groups, function(group){
          console.log(group);
          group.photos.sort(function(photoA, photoB){
            return photoA.interesting > photoB.interesting;
          })
          .slice(0,Math.max(1, Math.round(group.photos.length / 4 ))) // top 3 per twelve
          .forEach(function(photo){
            console.log(photo);
            photo.class = "span9";
          });
        });
      }
      $scope.groups = groups;

      setTimeout(function(){
        var wall = new Masonry( document.getElementById('wall'), {
            isAnimated: true
        });
      }, 400);
  };

  $scope.$watch('zoomLevel', function(value){
    
    var filteredPhotos = $scope.photos.filter(function(photo){

      return photo.interesting < $scope.zoomLevel;
    });

    $scope.recalulateGroups(filteredPhotos);

  });

  var getGroup = function(groups, photo){
    // group on date per default, TODO: add switch and control for this
    var groupName = photo.taken.split('T')[0],
        group = groups[groupName] = groups[groupName] || {};
    
    // split the groups if they are too big (based on interestingness)
    while(group.length > 20) {
      groupName = groupName + "_2";
      group = groups[groupName] = groups[groupName] || {};
    }

    group.name = photo.taken.split('T')[0];
    group.photos = group.photos || [];
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