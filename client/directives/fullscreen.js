
appProvider.directive('fullscreen', function(){

  return function(scope, element, attr){
    element.bind('click', function(event) {
      var documentElement = document.documentElement;
      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen(scope.fullscreen);
      }
      else if (documentElement.mozRequestFullScreen) {
        documentElement.mozRequestFullScreen(scope.fullscreen);
      }
      else if (documentElement.webkitRequestFullScreen) {
        documentElement.webkitRequestFullScreen(scope.fullscreen);
      }
      scope.fullscreen = !scope.fullscreen;
    });
  };
});