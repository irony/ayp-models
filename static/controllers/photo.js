function PhotoController($scope, $http){
  
  var zoomTimeout = null;
  $scope.photos = [];
  $scope.groups = {};
  $scope.dateRange = new Date();
  $scope.lastDate = null;

  $scope.zoomLevel = 50;

  var counter = 0;
  $scope.loadMore = function(zoomLevel, startDate) {

    var query = {skip : counter, interestingness : zoomLevel, startDate : startDate, limit: 40};
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
      $scope.lastDate = data[data.length-1].taken;

      if (startDate){ // append instead of reloading
        Array.prototype.push.apply($scope.photos, data);
        /*$scope.photos = data.sort(function(a,b){
          return a.taken - b.taken;
        }.reduce(function(a,b){
          return a.taken !== b.taken ? [a,b] : [a];
        }, []));*/
      } else {
        $scope.photos = data;
      }


      // counter += data.length;
      $scope.recalculateGroups($scope.photos);
    });
  };

  $scope.recalculateGroups = function(photos){
     
      var filteredPhotos = photos.filter(function(photo){
        return (photo.interestingness > 100 - $scope.zoomLevel);  
      });

      var groups = {};

      var groupArray = []; //  fix to reverse sort order

      if (filteredPhotos.length > 0){
        (filteredPhotos||[]).forEach(function(photo){
          var group = getGroup(groups, photo);
          group.photos.push(photo);
        });
        

        angular.forEach(groups, function(group){
          groupArray.push(group);

          group.photos.sort(function(photoA, photoB){
            return photoA.interestingness < photoB.interestingness;
          })
          .map(function(photo){
            photo.class = "span3";
            return photo;
          })
          .slice(0, Math.max(1, Math.round(group.photos.length / 8 ))) // top 3 per twelve
          .forEach(function(photo){
            photo.class = "span6 pull-left";
          });
        });
      }

      $scope.groups = groupArray;
/*

      setTimeout(function(){
        var wall = new Masonry( document.getElementsById('wall'), {
            isAnimated: true
        });
      }, 400);*/
  };

  var timeout = null;

  $scope.$watch('zoomLevel', function(value){
    
    clearTimeout(timeout);

    timeout = setTimeout(function(){
      $scope.loadMore(value);
    }, 100);

  });

  var getGroup = function(groups, photo){
    // group on date per default, TODO: add switch and control for this
    var groupName = getGroupName(photo),
        group = groups[groupName] = groups[groupName] || {};
    
    // split the groups if they are too big
    while(group.length > 20) {
      groupName = groupName + "_2";
      group = groups[groupName] = groups[groupName] || {};
    }

    group.photos = group.photos || [];

    if (group.photos.length){
      if (group.photos[group.photos.length-1].taken.split('T')[0] === group.photos[0].taken.split('T')[0])
      {
        group.name = group.photos[0].taken.split('T')[0];
      }
      else
      {
        group.name = group.photos[group.photos.length-1].taken.split('T')[0] + " - " + group.photos[0].taken.split('T')[0];
      }
      group.id = groupName;
    }
    return group;
  };

  var getGroupName = function(photo){

    if ($scope.zoomLevel > 80) {
      return photo.taken.split('T')[0]; // whole date
    }

    if ($scope.zoomLevel >= 50) {
      return photo.taken.substring(0, 7); // month
    }

    if ($scope.zoomLevel > 20){
      return photo.taken.substring(0, 4); // year
    }

    return photo.taken.substring(0, 3); // decade

  };

  // initial loading of photos
  $scope.loadMore($scope.zoomLevel);
}

var loadTimeout;
