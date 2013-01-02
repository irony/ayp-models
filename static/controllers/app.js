var loadTimeout,
    loading = false;

function AppController($scope, $http)
{
    $scope.loadMore = null;
}

angular.module('app', []).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = document.body;
        window.onscroll = function(event) {
            if ($(window).scrollTop() + $(window).height() === $(document).height() || $(window).scrollTop() < 0) {
                if (!loading) setTimeout(function(){
                    scope.$apply(attr.whenScrolled, $(window).scrollTop());
                    loading = false;
                }, 200);
                loading = true;

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