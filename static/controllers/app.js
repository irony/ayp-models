
angular.module('app', []).directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        elm.bind('scroll', function() {
        
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight * 0.80) {
                clearTimeout(loadTimeout);
                loadTimeout= setTimeout(function(){
                  scope.$apply(attr.whenScrolled);
                }, 200);
            }
        });
    };
});