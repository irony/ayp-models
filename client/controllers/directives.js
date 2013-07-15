

appProvider.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = document.body;
    window.onscroll = function(event) {
      appScope.loadingReverse = $(window).scrollTop() < 0;
      appScope.scrollPosition = $(window).scrollTop();
      appScope.apply(attr.whenScrolled);
    };
  };
});

appProvider.directive('rightClick', function($parse) {
  return function(scope, element, attr) {
    element.bind('contextmenu', function(event) {
      var fn = $parse(attr.rightClick);
      if (fn){
        scope.$apply(function() {
          if (fn(scope, {
            $event: event
          })) {
            // only stop menu if we have something meaningful to do (returns true)
            event.preventDefault();
          }
        });
        return false;
      }
    });
  };
});

/*appProvider.directive('dragstart', function($parse) {
  return function(scope, element, attr) {
    var fn = $parse(attr['dragstart']);
    element.bind('dragstart', function(event) {
      scope.$apply(function() {
        fn(scope, {$event:event});
      });
    });
  };
})*/

appProvider.directive('fullscreen', function(){

  return function(scope, element, attr){
    element.bind('click', function(event) {
      var documentElement = document.documentElement;
      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen(scope.fullscreen);
      }
      else if (documentElement.mozRequestFullScreen) {
        documentElement.mozRequestFullScreen(scope.fullscreen);
      }
      else if (documentElement.webkitRequestFullScreen) {
        documentElement.webkitRequestFullScreen(scope.fullscreen);
      }
      scope.fullscreen = !scope.fullscreen;
    });
  };
});

appProvider.directive('lazy', function($parse){
  
  return function(scope, element, attr){
    element.bind('load', function(event) {
      var fn = $parse(attr.lazy);
      if (fn){
        scope.$apply(function() {
          fn(scope);
        });
      }
    });
  };
});

appProvider.directive('dropzone', function($parse){
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
          scope.files.sort(function(a,b){
            return b.lastModifiedDate - a.lastModifiedDate;
          });
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
});

appProvider.directive('dateFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$formatters.unshift(function(valueFromModel) {
        return valueFromModel && moment(valueFromModel).format('YYYY MMM DD');
        // return how data will be shown in input
      });

      ngModelCtrl.$parsers.push(function(valueFromInput) {
        var date = moment(valueFromInput);
        return date.isValid()? date.toDate().getTime() : null;
        // return how data should be stored in model
      });

      $(element).bind('mouseover', function(e){
        this.select();
      });

      $(element).bind('mouseout', function(e){
        window.getSelection().removeAllRanges();
      });
    }
  };
});

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