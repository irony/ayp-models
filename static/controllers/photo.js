function PhotoController($scope, $http){
  
  var zoomTimeout = null;
  $scope.photos = [];
  $scope.groups = {};
  $scope.dateRange = new Date();

  $scope.zoomLevel = 50;

  var counter = 0;
  $scope.loadMore = function() {
      console.log('loadMore', counter);

    var query = {skip : counter, interestingness : $scope.zoomLevel, limit: 100};
    $http.get('/photoFeed', {params : query})
    .success(function(data){

      data = (data||[]).map(function(photo){
        photo.src='/img/thumbnails/' + photo.source + '/' + photo._id;

        if (photo.interestingness === 50){
          photo.interestingness = Math.random() * 100; // dummy value now. TODO: change to real one
        }

        photo.class = "span3";
        return photo;
      });

      Array.prototype.push.apply($scope.photos, data);
      // counter += data.length;
      $scope.recalculateGroups($scope.photos);
    });
  };

  $scope.recalculateGroups = function(photos){
     
      console.log(photos.length)

      var filteredPhotos = photos.filter(function(photo){
        return (photo.interestingness > 100 - $scope.zoomLevel);  
      });

      console.log(filteredPhotos.length)

      var groups = {};
      if (filteredPhotos.length > 0){
        (filteredPhotos||[]).forEach(function(photo){
          var group = getGroup(groups, photo);
          group.photos.push(photo);
        });
        

        angular.forEach(groups, function(group){
          group.photos.sort(function(photoA, photoB){
            return photoA.interestingness < photoB.interestingness;
          })
          .map(function(photo){
            photo.class = "span3";
            return photo;
          })
          .slice(0, Math.max(1, Math.round(group.photos.length / 8 ))) // top 3 per twelve
          .forEach(function(photo){
            photo.class = "span9 pull-left";
          });
        });
      }
      $scope.groups = groups;
/*
      setTimeout(function(){
        var wall = new Masonry( document.getElementsByClassName('group'), {
            isAnimated: true
        });
      }, 400); */
  };

  var timeout = null;

  $scope.$watch('zoomLevel', function(value){
    
    clearTimeout(timeout);

    timeout = setTimeout(function(){
      $scope.loadMore();
    }, 100);

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