var loadTimeout;
var appScope;

function AppController($scope, $http)
{
    $scope.loadMore = null;
    $scope.loading = false;
    $scope.loadingReverse = false;
    appScope = $scope;
}

angular.module('app', [])
.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = document.body;
        window.onscroll = function(event) {
            if ($(window).scrollTop() + $(window).height() === $(document).height() || $(window).scrollTop() < 0) {
                appScope.loadingReverse = $(window).scrollTop() < 0;
                scope.$apply(attr.whenScrolled);
            }
        };
    }})
.directive('slideshow', function() {
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
   return openDialog;})
.directive('rightClick', function($parse) {
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
})
.directive('datepicker', function() {
   return function(scope, element, attrs) {

        element.daterangepicker(
          {
              format: 'yyyy-MM-dd',
              ranges: {
                  'Today': ['today', 'today'],
                  'Yesterday': ['yesterday', 'yesterday'],
                  'Last 7 Days': [Date.today().add({ days: -6 }), 'today'],
                  'Last 30 Days': [Date.today().add({ days: -29 }), 'today'],
                  'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
                  'Last Month': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
              }
          },
          function(start, end) {
              var modelPath = $(element).attr('ng-model');
              scope[modelPath] = start.toString('yyyy-MM-dd') + ' - ' + end.toString('yyyy-MM-dd 23:59:59');
              scope.$apply();
          }
        );

   };
});

;