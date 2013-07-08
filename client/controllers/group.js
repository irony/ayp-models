function GroupCtrl($scope){
  $scope.group = null;

  $scope.$watch('group.active', function(state, oldState){
    $scope.group.photos.forEach(function(photo){
      photo.left += state && 300 || oldState && -300 || 0;
      photo.actingVote = state && 0 || photo.vote;
    });

  });

  $scope.click =function(){
    $scope.group.active = !$scope.group.active;
    $scope.group.bind();
  };
}


function Group(){
  this.photos = [];
  return this;
}

Group.prototype.finish = function(){


  var visible = this.photos.filter(function(a){return a.active });

  if (!visible.length) return null;

  var first = (visible.length && visible[0]); //+ 20;
  var last = visible.length && visible[visible.length-1] || null;

  //photos.forEach(function(photo){photo.top += 20});
  
  this.id = first && first.cluster.split('.')[0];
  this.visible = visible.length;
  this.height = last && (last.top + last.height - top) - 5 || 0;
  this.bottom = last && (last.top + last.height) - 5 || 0;
  this.right = last && (last.left + last.width) || 0;
  this.from = last.taken;
  this.to = first.taken;
  this.duration = moment(this.from).from(this.to, true);
  this.name = moment(this.from).format("ddd D MMM YYYY") + "(" + this.duration + ")";

  console.log('finish', this);
};

Group.prototype.bind = function(top, left, height, zoomLevel){
  var padding = 1;
  var maxWidth = window.innerWidth;

  this.top = top;
  this.left = left;

  this.rows = (this.photos).reduce(function(rows, photo, i){

    if (!photo) return rows;

    // Only show visible photos
    if (photo && photo.src && (photo.vote <= zoomLevel  || (photo.actingVote || 10) <= zoomLevel) ) {

      photo.active = true;

      photo.height = height;
      photo.width = photo.height * (photo.ratio || 1);
      photo.top = top;
      photo.left = left + padding;
      var row = rows.slice(-1)[0];
      row.push(photo);

      if (photo.left + photo.width > maxWidth){
        closeRow(row, maxWidth);
        top += photo.height + padding;
        left = 5;
        rows.push([]);
      } else {
        left = photo.left + photo.width + padding;
      }

    } else{
      photo.active = false;
    }

    return rows;

  }, [[]]);

  this.finish();
};



function closeRow(row, maxWidth){
  var visible = row.filter(function(photo){return photo.active});
  var last = visible[visible.length-1];
  if (!last) return;

  var rowWidth = last.left + last.width;

  var percentageAdjustment = maxWidth / (rowWidth);

  // adjust height
  visible.forEach(function(photo, i){
    photo.left *= percentageAdjustment;
    photo.width *= percentageAdjustment;
    photo.height *= percentageAdjustment;
  });
}