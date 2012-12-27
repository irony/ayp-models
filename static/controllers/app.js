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
            if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                if (!loading) setTimeout(function(){
                    scope.$apply(attr.whenScrolled);
                    loading = false;
                }, 200);
                loading = true;

            }
        };
    };
});