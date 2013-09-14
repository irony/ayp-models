

appProvider.directive('keyListener', function(){
  return function(scope, element, attr){
    element.addEventListener( 'keydown', function( e ) {
      var keyCode = e.keyCode || e.which,
          keys = {
            27: 'esc',
            32: 'space',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            48: 'zero',
            49: 'one',
            50: 'two',
            51: 'three',
            52: 'four',
            53: 'five',
            54: 'six',
            55: 'seven',
            56: 'eight',
            57: 'nine'
          };
      

      var current = scope.photosInView.sort(function(a,b){return b.taken - a.taken}).indexOf(scope.selectedPhoto);

      switch (keys[keyCode]) {
        case 'space' :
          if (scope.selectedPhoto)
            scope.select(null);
          else
            scope.select(scope.photoInCenter);

          scope.$apply();
          e.preventDefault();
        break;

        case 'esc' :
          scope.select(null);
          scope.$apply();
          // e.preventDefault();
        break;
        case 'left':
          scope.select(current > 0 ? scope.photosInView[current -1 ] : null);
          e.preventDefault();
          
        break;
        case 'right':
          scope.select(scope.photosInView.length > current ? scope.photosInView[current +1 ] : null);
          e.preventDefault();
        break;
        case 'up':
          if (scope.selectedPhoto){
            scope.selectedPhoto.zoomLevel++;
            scope.selectedPhoto.zoom(scope.selectedPhoto.zoomLevel);
            e.preventDefault();
          }
          //..
        break;
        case 'down':
          if (scope.selectedPhoto){
            
            scope.selectedPhoto.zoomLevel--;
            scope.selectedPhoto.zoom(scope.selectedPhoto.zoomLevel);
            
            if(!scope.selectedPhoto.zoomLevel) scope.select(null);
            
            e.preventDefault();
          }
          //..
        break;
        /*
        case 'zero' : scope.vote(0); break;
        case 'one' : vote($('.selected')[0].id, 1); break;
        case 'two' : vote($('.selected')[0].id, 2); break;
        case 'three' : vote($('.selected')[0].id, 3); break;
        case 'four' : vote($('.selected')[0].id, 4); break;
        case 'five' : vote($('.selected')[0].id, 5); break;
        case 'sixe' : vote($('.selected')[0].id, 6); break;
        case 'seven' : vote($('.selected')[0].id, 7); break;
        case 'eight' : vote($('.selected')[0].id, 8); break;
        case 'nine' : vote($('.selected')[0].id, 9); break;
        */
      }
    });
  };
})

appProvider.directive('rightClick', function($parse) {
  return function(scope, element, attr) {
    element.bind('contextmenu', function(event) {
      var fn = $parse(attr.rightClick);
      if (fn){
        scope.$apply(function() {
          if (fn(scope, {
            $event: event
          })) {
            // only stop menu if we have something meaningful to do (returns true)
            event.preventDefault();
          }
        });
        return false;
      }
    });
  };
});