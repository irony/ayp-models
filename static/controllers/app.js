var loadTimeout;

function AppController($scope, $http)
{
    $scope.loadMore = null;
    $scope.loading = false;
    $scope.loadingReverse = false;
}

angular.module('app', []).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = document.body;
        window.onscroll = function(event) {
            if ($(window).scrollTop() + $(window).height() === $(document).height() || $(window).scrollTop() < 0) {
                if (!scope.loading) setTimeout(function(){
                    scope.$apply(attr.whenScrolled);
                    scope.loadingReverse = $(window).scrollTop() < 0;
                }, 200);
                scope.loading = true;
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
});