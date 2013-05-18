var loadTimeout;
var appScope;

function AppController($scope, $http)
{
  var socket = io.connect();

  $scope.loadMore = null;
  $scope.loading = false;
  $scope.loadingReverse = false;
  $scope.scrollPercentage = 0;

  appScope = $scope;
  $scope.stats = localStorage && localStorage.getObject('stats');

  socket.on('connect', function(data){
    socket.on('trigger', function(trigger){
      var photo = $scope.library.photos.filter(function (item) {
        return item.taken === new Date(trigger.item.taken).getTime();
      }).pop();

      if (photo){
        angular.extend(photo, trigger.item); // update existing
      }
      else{
        $scope.library.photos.push(trigger.item); // add
      }

      console.log('trigger', data.type + '/' + data.action);

    });
  });

  $scope.$watch('stats', function(value){
    if (!value){

      $http.get('/api/stats', {params: null}).success(function(stats){
        $scope.stats = stats;

          // TODO: add invalidation of library cache if size has changed
          console.log('stats', stats);
        }).error(function(err){
          console.log('stats error');
        });
      }
    });

  function loadMore(taken, done){

    $http.get('/api/library', {params: {taken:taken || new Date().getTime() }})
    .success(function(library){

      library.photos.reduce(function(a,b){
        if (!b) return;
        
        b.src=b.src.replace('$', library.baseUrl);
        a.push(b);
      }, $scope.library.photos);

      // next is a cursor to the next date in the library
      if (library.next){
        return loadMore(library.next, done);
      } else{
        console.log('done library', $scope.library.photos.length);
        return done && done(null, $scope.library.photos);
      }

    })
    .error(function(err){
      console.log('library error', err);
    });
  }

  $scope.library = sessionStorage && sessionStorage.getObject('library') || {photos:[]};

  $scope.$watch('library', function(value){

    // we already have the whole library
    if ($scope.stats && $scope.stats.all <= value.photos.length)
      return;

    console.log('loading library', value);

    var lastPhoto = $scope.library.photos && $scope.library.photos.length && $scope.library.photos.slice(-1)[0];
    loadMore(lastPhoto && lastPhoto.taken, function(){
      if (sessionStorage) sessionStorage.setObject('library', $scope.library);
    });

  });

}

angular.module('app', [])
.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = document.body;
    window.onscroll = function(event) {
      appScope.loadingReverse = $(window).scrollTop() < 0;
      appScope.scrollPercentage = $(window).scrollTop() / $(document).height() * 100;
      appScope.scrollPosition = $(window).scrollTop();
      scope.$apply(attr.whenScrolled);
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
/*.directive('dragstart', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['dragstart']);
    element.bind('dragstart', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
})*/
.directive('dropzone', function($parse){
  return function(scope, element, attr){
    $(document).bind('dragover', function(e){e.preventDefault()});
    $(document).bind('drop', function(event) {
      var e = event.originalEvent;
      e.preventDefault();

      element.modal();
      
      var updateTimeout;
      var addFile = function(file, path){
        if(file.type.match(/image\.*/)){
          file.path = path;
          scope.files.push(file);

          // wait until we have found all files before updating the view
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(function(){
            scope.$apply();
          }, 200);
        }
      };
      var i = 0;
      angular.forEach(e.dataTransfer.items, function(item){
        var entry = item.webkitGetAsEntry();
        var file = e.dataTransfer.files[i];
        i++;
        if (entry.isFile) {
          addFile(file);
          console.log('file', file, entry);
        } else if (entry.isDirectory) {
          traverseFileTree(entry, null, addFile);
        }


      });
      // initial binding
      scope.$apply();

    });


    /* Traverse through files and directories */
    function traverseFileTree(item, path, callback, done) {
      path = path || "";
      if (item.isFile) {
        // Get file
        item.file(function(file) {
          if(file.type.match(/image\.*/)){
            callback(file, path);
          } else {
            // TODO: identify iPhoto package and extract it
          }
        });
      } else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function(entries) {
          angular.forEach(entries, function(entry){
            setTimeout(function(){
              traverseFileTree(entry, path + item.name + "/", callback, scope.$apply);
            },20);
          });
        });
        if (done) done();
      }
    }
    /* Main unzip function */
    /*function unzip(zip){
        model.getEntries(zip, function(entries) {
            entries.forEach(function(entry) {
                model.getEntryFile(entry, "Blob");
            });
        });
}*/

    //model for zip.js
    /*var model = (function() {

        return {
            getEntries : function(file, onend) {
                zip.createReader(new zip.BlobReader(file), function(zipReader) {
                    zipReader.getEntries(onend);
                }, onerror);
            },
            getEntryFile : function(entry, creationMethod, onend, onprogress) {
                var writer, zipFileEntry;

                function getData() {
                    entry.getData(writer, function(blob) {

                    //read the blob, grab the base64 data, send to upload function
                    oFReader = new FileReader()
                    oFReader.onloadend = function(e) {
                      upload(this.result.split(',')[1]);
                    };
                    oFReader.readAsDataURL(blob);
                 
                    }, onprogress);
                }
                    writer = new zip.BlobWriter();
                    getData();
            }
        };
    })();
*/
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


Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}