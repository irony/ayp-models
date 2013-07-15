function GroupCtrl($scope){
  $scope.group = null;

  $scope.$watch('group.active', function(state, oldState){
    if (state){
      $scope.group.left = state && 300 || 0;
      $scope.group.zoomLevel = state && 0 || $scope.zoomLevel;
//      $scope.group.bind($scope.group.top, $scope.group.left, $scope.height, $scope.group.zoomLevel);
    }

  });

  $scope.click =function(){
    $scope.group.active = !$scope.group.active;
  };
}


function Group(){
  this.photos = [];
  return this;
}

Group.prototype.finish = function(){


  if (!this.rows.length) return null;

  var first = (this.rows[0][0]); //+ 20;
  var last = this.rows[this.rows.length-1].slice(-1)[0];

  //photos.forEach(function(photo){photo.top += 20});
  
  //this.id = first.cluster.split('.')[0];
  this.visible = this.rows.reduce(function(a,b){return a+b.length},0);
  this.height = (last.top + last.height - this.top);
  this.bottom = (last.top + last.height) || this.top;
  this.right = (last.left + last.width);
  this.from = this.photos[0].taken;
  this.to = this.photos.slice(-1)[0].taken;
  this.left = first.left;
  this.top = first.top;
  this.duration = moment(this.from).from(this.to, true);
  this.name = moment(this.from).format("ddd D MMM YYYY") + "(" + this.duration + ")";

};

Group.prototype.bind = function(top, left, rowHeight, zoomLevel){
  var padding = 1;
  var maxWidth = window.innerWidth;
  var group = this;
  this.left = left;
  this.top = top;
  group.zoomLevel = zoomLevel || group.zoomLevel;

  this.rows = (this.photos).reduce(function(rows, photo, i){

    if (!photo) return rows;

    // Only show visible photos
    if (photo && photo.src && (photo.vote <= group.zoomLevel )) {

      photo.active = true;
      group.id = photo.cluster && photo.cluster.split('.')[0] || null;

      photo.height = Math.floor(rowHeight);
      photo.width = Math.floor(photo.height * (photo.ratio || 1));
      photo.top = Math.floor(top);
      photo.left = Math.floor(left) + padding;
      var row = rows.slice(-1)[0];
      row.push(photo);

      if (photo.left + photo.width > maxWidth){
        closeRow(row, maxWidth);
        // row.map(function(photo){photo.left += group.left});
        top = photo.top + photo.height + padding;
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

  this.rows = this.rows.filter(function(a){return a.length});

/*
  if (this.rows && this.rows.length){
    if (left < ){
      var totalHeight = this.rows.reduce(function(a,b){return a+b[0].height}, 0);
      var remainder = maxWidth - 
      group.bind(this.top, this.left, totalHeight * )
    }

    closeRow(this.rows.slice(-1)[0], maxWidth);
  }*/
  
  this.finish();
};



function closeRow(row, maxWidth){
  if (!row) throw "Row is empty";

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