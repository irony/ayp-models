var loadTimeout;
var appScope;

function AppController($scope, $http)
{
  var socket = io.connect();

  $scope.loadMore = null;
  $scope.loading = false;
  $scope.loadingReverse = false;
  $scope.scrollPercentage = 0;
  $scope.scrollPosition = 0;

  appScope = $scope;
  $scope.stats = localStorage && localStorage.getObject('stats');

  socket.on('connect', function(data){
    console.log('connect');
    socket.on('trigger', function(trigger){
      console.log('trigger', trigger);

      var photo = $scope.library.photos.filter(function (item) {
        return item.taken === new Date(trigger.item.taken).getTime();
      }).pop();

      if (photo){
        angular.extend(photo, trigger.item); // update existing
      }
      else{
        $scope.library.photos.push(trigger.item); // add
      }


    });
  });

  $scope.$watch('scrollPosition', function(value){

    // force reload check when scrolling to top.
    // if (value < 0 && !$scope.stats) $scope.stats = null;

  });

  $scope.$watch('stats', function(value){
    if (!value){
      console.log('loading stats');
      
      $http.get('/api/stats', {params: null}).success(function(stats){
        $scope.stats = stats;

        if ($scope.library && $scope.library.modified && $scope.stats.modified > $scope.library.modified)
        {
          loadLatest($scope.library.modified);
        }

        setInterval(function(){
          $scope.stats = null; // reset and load new every 30 seconds
        }, 30000);
      }).error(function(err){
        console.log('stats error');
      });
    }
  });


  // load all photos based on modify date. It means we can fill up the library on newly changed
  // photos or recently added photos without loading the whole library again.
  function loadLatest(modified, done){

    $http.get('/api/library', {params: {modified:modified}, cache: true})
    .success(function(page){

      if (!page || !page.photos) return;

      // we want to replace the old ones with the new ones or insert the newest ones first
      _.reduce(page.photos, function(a,b){
        b.src=b.src && b.src.replace('$', page.baseUrl) || null;

        _.find(a, {_id: b._id}, function(existing){
        // look for this photo in the library and update if it was found
          if (existing) {
            existing = b;
          } else {
            a.unshift(b);  // otherwise - insert it first
          }
        });

        return a;
      }, $scope.library.photos || []);

      // next is a cursor to the next date in the library
      if (page.next){
        console.log('next latest', page.next);
        return loadLatest(page.next, done);
      } else{
        // THE END
        console.log('done latest', page.modified);
        $scope.library.modified = page.modified;
        return done && done(null, $scope.library.photos);
      }

    })
    .error(function(err){
      console.log('library error', err);
      return done(err);
    });

  }

  // Load library based on photo taken, this will recurse until it reaches the end of the library
  function loadMore(taken, done){
    $http.get('/api/library', {params: {taken:taken || new Date().getTime() }, cache: true})
    .success(function(page){

      if (!page || !page.photos || !page.photos.length) return done && done();

      if ($scope.library.userId !== page.userId || !$scope.library.photos)
        $scope.library = {photos:[], userId : page.userId }; // reset if we are logged in as new user


      if (_.find($scope.library.photos, {taken:page.photos[0].taken})) return done && done();

      _.each(page.photos, function(photo){
        photo.src=photo.src && photo.src.replace('$', page.baseUrl) || null;
        $scope.library.photos.push(photo);
      });

      // next is a cursor to the next date in the library
      if (page.next){
        if (_.find($scope.library.photos, {taken:page.next})) return done && done();
        console.log('next more', page.next);
        loadMore(page.next, done);
      } else{
        console.log('done more', page.modified);
        $scope.library.modified = page.modified;

        return done && done(null, $scope.library.photos);
      }

    })
    .error(function(err){
      console.log('library error', err);
      return done(err);
    });
  }

  function sortAndRemoveDuplicates(){
    $scope.library.photos.sort(function(a,b){
        return b.taken - a.taken;
    });

    var i = $scope.library.photos.length;
    while (i--) {
      if (i && $scope.library.photos[i-1].taken === $scope.library.photos[i].taken) {
        $scope.library.photos.splice(i,1);
      }
    }
  }
  
  var server;

  function initialize(){

    $scope.library = localStorage && localStorage.getObject('library') || {modified:null, photos:[],userId:null};
    $scope.library.photos = $scope.library.photos || [];


    if (window.shimIndexedDB) window.shimIndexedDB.__useShim();

    async.parallel({
      end : function(done){
        var lastPhoto = ($scope.library.photos || []).slice(-1)[0];
        loadMore(lastPhoto && lastPhoto.taken, done);
      },
      beginning : function(done){
        loadMore(null, done);
      },
      changes : function(done){
        var lastModifyDate = $scope.library.modified && new Date($scope.library.modified).getTime() || null;
        if (lastModifyDate) loadLatest(lastModifyDate, done);
      },
      db : function(done){
        db.open({
          server: 'my-app',
          version: 1,
          schema: {
            photos: {
              key: { keyPath: 'taken' , autoIncrement: false }
            }
          }
        }).done( function ( s ) {
          server = s;

          console.log('indexdb opened ok', s);

          server.photos.query()
          .all()
          .execute()
          .fail(function(err){
            console.log('db fail', err);
            done(err);
          })
          .done( function ( photos ) {
            // descending order
            $scope.library.photos.concat(photos.reverse());
            done(null, photos);
          });
        });
      }
    }, function(result){

      console.log('done async load', $scope.library);
      sortAndRemoveDuplicates();

      if (localStorage) localStorage.setObject('library', {modified: $scope.library.modified, userId: $scope.library.userId});
      if (server) {
        server.photos.update.apply($scope.library.photos); // update means put == insert or update
      } else {
        // load every time as fallback
      }
    });



  }

  initialize();

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
.directive('fullscreen', function(){

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
})
.directive('lazy', function($parse){
  
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
})
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
})
.directive('dateFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$formatters.unshift(function(valueFromModel) {
        return valueFromModel && moment(valueFromModel).format('YYYY MMM DD');
        // return how data will be shown in input
      });

      ngModelCtrl.$parsers.push(function(valueFromInput) {
        var date = moment(valueFromInput);
        console.log('date', date)
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
})
.directive('datepicker', function() {
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


Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
}