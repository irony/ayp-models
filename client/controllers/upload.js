function UploadController($scope, $http){

  $scope.state = null;
  $scope.channels = 2;
  $scope.queue = [];
  $scope.uploading = true;
  $scope.files = [];
  $scope.doneSize = 0;

  $scope.$watch('channels + queue.length', function(channels){
    $scope.uploading = channels > 0 && $scope.queue.length > 0;
  });

  $scope.$watch('uploading', function(uploading){
    $scope.files.filter(function(file){return file.state === "Processing" || file.state === "Uploading" }).map(function(file){
      file.state = ''; // restart the current uploading files and try again
      file.progress = 0;
      file.thumbnail = null;
    });
  });

  $scope.$watch('files.length - queue.length', function(left){
    var progress = $scope.doneSize / $scope.allSize;
    console.log('progress', progress, $scope.doneSize, $scope.allSize);
    Piecon.setProgress(progress * 100);
  });

  $scope.$watch('files.length', function(files){
    if (!$scope.files) return;

    $scope.allSize = 0;
    $scope.files
    .sort(function(a,b){
      return b.modified - a.modified;
    })    //.reduce(function(a,b){a.slice(-1).modified !== b.modified && a.push(b); return a}, [])
    .forEach(function(photo){
      $scope.allSize += photo.size;
    });
//     console.log($scope.allSize);
  });

  var uploadInterval;
  $scope.$watch('uploading', function(on){
    clearInterval(uploadInterval);

    if (on){
      // check every interval for new files to process but don't add new if the current ones are in a processing state
      uploadInterval = setInterval(function(){

        // rebuild the queue
        $scope.queue = $scope.files.filter(function(file){
          return !file.state || file.state === "Processing" || file.state === "Uploading";
        });

        // remove duplicates and read exif
        $scope.queue.slice(0, $scope.channels * 2).forEach(function(file){
          if (file.exif === undefined){
            readExif(file, function(err, exif){
              if (err)
                return file.status = "Error";

              file.exif = exif;
              file.taken = exif && exif.DateTime ? exif.DateTime.slice(0,10).split(':').join('-') + exif.DateTime.slice(10) : null;
              var exists = exif && ($scope.library.photos.filter(function(photo){
                return photo.taken === new Date(file.taken).getTime();
              }).length);

              if (exists) return file.state = "Duplicate";
            });
          }
        });

        // of the processed files in the queue, start processing a few
        $scope.queue.filter(function(file){ return file.exif !== undefined})
        .slice(0,$scope.channels + 1).forEach(function(file){
          if (!file.started){
            file.started = true;

            // TODO: replace these to calls to worker instead
            generateThumbnail(file, {
              width:640,
              height:480
            },
            function(err, thumbnail){
              if (err) return file.state = 'Error';
              file.thumbnail = thumbnail;
              uploadFile(file, function(err, file, photo){
                if (err) {
                  file.state = 'Error';
                  file.error = err;
                  file.progress = 30;
                  console.log('Error:', file.error);
                } else {
                  $scope.doneSize += file.size;
                  file.state = 'Done';
                  file.progress = 100;
                }
              });
            });
          }
        });

        if ($scope.queue.length === 0){
          $scope.uploading = false;
          clearInterval(uploadInterval);
        }

        $scope.$apply();
      }, 500);
    }
  });


  // TODO: move these to a worker instead
  function readExif(file, done){
    if(!done) throw "Callback required";

    var fr   = new FileReader;
    fr.onloadend = function() {
      try{
        var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
        done(null, exif);
      } catch(err){
        done(err);
      }
    };
    fr.readAsBinaryString(file);
  }

  function uploadFile(file, done){
    var fd = new FormData();
    var thumbnail = dataURItoBlob(file.thumbnail);
    
    if (file.exif)
      fd.append('exif', JSON.stringify(file.exif));

    if (file.path)
      fd.append('path', file.path + file.filename);

    fd.append('original|' + file.taken + '|' + file.size, file);
    fd.append('thumbnail' + '|' + file.taken + '|' + thumbnail.size, thumbnail);
    console.log('uploading...', file.taken, thumbnail.size);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 2 * 60 * 1000;
    xhr.open("POST", "/api/upload", true);

    xhr.onload = function() {
      if(this.status !== 200){
        return done(new Error(xhr.responseText), file);
      } else {
          var response = xhr.responseText;
          var photo = JSON.parse(response);

          delete file.thumbnail; // save memory
          delete file.exif;
          return done(null, file, photo);
      }
    };

    xhr.ontimeout = function(){
      file.state = 'Error';
    };

    // Listen to the upload progress.
    xhr.upload.onprogress = function(e) {
        file.state = 'Uploading';
      if (e.lengthComputable) {
        file.progress = (e.loaded / e.total) * 100;
      } else {
        file.progress = Math.min(file.progress++, 100);
      }
    };

    xhr.onreadystatechange=function(){
      if (xhr.status > 200)
        done(xhr.status, file);
    };

    file.progress = 1;
    try{
      xhr.send(fd);
    } catch(err){
      done(err, file);
    }
  }


  function generateThumbnail(file, options, done){

    options = options || {};
    var img = document.createElement("img");
    var reader = new FileReader();
    
    try {
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

          var thumbnail = canvas.toDataURL('image/jpeg');
          if (done) return done(null, thumbnail);
        };
      };
    } catch(err){
      if (done) return done(err);
    }
  }

  function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for(var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }
}
 