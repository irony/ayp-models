
appProvider.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = document.body;
    window.onscroll = function(event) {
      appScope.loadingReverse = $(window).scrollTop() < 0;
      appScope.scrollPosition = $(window).scrollTop();
      appScope.apply(attr.whenScrolled);
    };
  };
});