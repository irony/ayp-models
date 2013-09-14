
appProvider.directive('datepicker', function() {
  return function(scope, element, attrs) {

    $(element).daterangepicker(
      {
        format: 'yyyy-MM-dd',
        ranges: {
          'Today': ['today', 'today'],
          'Yesterday': ['yesterday', 'yesterday']
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