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
});