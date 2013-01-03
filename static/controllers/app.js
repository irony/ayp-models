var loadTimeout;
var appScope;

function AppController($scope, $http)
{
    $scope.loadMore = null;
    $scope.loading = false;
    $scope.loadingReverse = false;
    appScope = $scope;
}

angular.module('app', []).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = document.body;
        window.onscroll = function(event) {
            if ($(window).scrollTop() + $(window).height() === $(document).height() || $(window).scrollTop() < 0) {
                appScope.loadingReverse = $(window).scrollTop() < 0;
                scope.$apply(attr.whenScrolled);
            }
        };
    };
}).directive('slideshow', function() {
      var openDialog = {
         link :   function(scope, element, attrs) {
            function openDialog() {
              var element = angular.element('#slideshow');
              var ctrl = element.controller();
              ctrl.setModel(scope);
              element.modal('show');
            }
            element.bind('click', openDialog);
       }
   };
   return openDialog;
}).directive('rightClick', function($parse) {
                console.log('rightclick');
    return function(scope, element, attr) {
                console.log('rightclick');
        element.bind('contextmenu', function(event) {
            event.preventDefault();
            var fn = $parse(attr.rightClick);
            scope.$apply(function() {
                console.log('rightclick');
                fn(scope, {
                    $event: event
                });
            });
            return false;
        });
    };
});