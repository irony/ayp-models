var loadTimeout;
var appScope;

function AppController($scope, $http)
{
    $scope.loadMore = null;
    $scope.loading = false;
    $scope.loadingReverse = false;
    $scope.scrollPercentage = 0;

    appScope = $scope;
    $scope.stats = localStorage && localStorage.getObject('stats');

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

    $scope.library = localStorage && localStorage.getObject('library');

    $scope.$watch('library', function(value){
          console.log('loading library', value);
      if (!value || typeof(value) !== "object"){

        $http.get('/api/library', {params: null}).success(function(library){
          $scope.library = library;
          console.log('library', library);
          if (localStorage) localStorage.setObject('library', library);
          
        }).error(function(err){
          console.log('library error');
        });
      }
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
    element.bind('dragover', function(e){e.preventDefault()});
    element.bind('drop', function(event) {
      var e = event.originalEvent;
      e.preventDefault();
      console.log(e, arguments);
      var length = e.dataTransfer.items.length;
      var addFile = function(file){
        if(file.type.match(/image\.*/)){
          generateThumbnail(file, {width:640, height:480}, function(err, file){
            scope.files.push(file);
            scope.$apply();
          });
        }
      };

      for (var i = 0; i < length; i++) {
        var entry = e.dataTransfer.items[i].webkitGetAsEntry();
        var file = e.dataTransfer.files[i];
        var zip = file.name.match(/\.zip/);
        if (entry.isFile) {
          addFile(file);
        } else if (entry.isDirectory) {
          traverseFileTree(entry, null, addFile);
        }
      }
    });


    function generateThumbnail(file, options, done){
      options = options || {};
      var img = document.createElement("img");
      var reader = new FileReader();
      
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        img.src = this.result;
        var MAX_WIDTH = options.width || 640;
        var MAX_HEIGHT = options.height || 480;
     
        img.onload = function(){

          var width = img.width;
          var height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          var ctx = canvas.getContext("2d");
          ctx.drawImage(this, 0, 0, width, height);

          file.thumbnail = canvas.toDataURL("image/jpeg");
          if (done) return done(null, file);
        };
      };
    }


    /* Traverse through files and directories */
    function traverseFileTree(item, path, callback) {
      path = path || "";
      if (item.isFile) {
        // Get file
        item.file(function(file) {
            if(file.type.match(/image\.*/)){
                callback(file);
            }
        });
      } else if (item.isDirectory) {
        // Get folder contents
        var dirReader = item.createReader();
        dirReader.readEntries(function(entries) {
          for (var i=0; i<entries.length; i++) {
            traverseFileTree(entries[i], path + item.name + "/", callback);
          }
        });
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