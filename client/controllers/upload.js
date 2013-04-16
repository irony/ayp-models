function UploadController($scope, $http){

  $scope.state = null;
  $scope.channels = 2;
  $scope.queue = [];
  $scope.uploading = true;
  $scope.files = [];

  $scope.$watch('channels + queue.length', function(channels){
    $scope.uploading = channels > 0 && $scope.queue.length > 0;
  });

  $scope.$watch('uploading', function(uploading){
    console.log('uploading', uploading)
    $scope.files.filter(function(file){return file.state === "Processing" || file.state === "Uploading" }).map(function(file){
      file.state = ''; // restart the current uploading files and try again
      file.progress = 0;
      file.thumbnail = null;
    });
  });

  $scope.$watch('files.length - queue.length', function(left){
    Piecon.setProgress(left / $scope.files.length);
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
        $scope.queue = $scope.files.filter(function(file){return !file.state || file.state === "Processing" || file.state === "Uploading" });
        $scope.queue.slice(0,$scope.channels).forEach(function(file){
          if (file.thumbnail === undefined) generateThumbnail(file, {width:1800, height:1200}, function(err, file){
            if (!err) queueFile(file, $scope.upload);
          });
        });
        if ($scope.queue.length === 0){
          $scope.uploading = false;
          $scope.library = null; // force reloading of library
          clearInterval(uploadInterval);
        }
        $scope.$apply();
      }, 500);
    }
  });

  function queueFile(file) {
    var fr   = new FileReader;
    fr.onloadend = function() {
        if ($scope.library && $scope.library.photos){
          var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));

          if ($scope.library.photos.filter(function(photo){
            var taken = exif.DateTime ? exif.DateTime.slice(0,10).split(':').join('-') + exif.DateTime.slice(10) : null;
            return photo.taken == taken;
          }).length) return file.state = "Duplicate";
        }
        
        if (!file.state) {
          uploadFile(file, exif, function(err, file, photo){
            if (err) return console.log('Error when uploading', err);
            if (!$scope.library.photos) $scope.library.photos.push(photo);
            $scope.uploading = true;
            // TODO: remove from collection to save memory
            
          });
        }
    };
    fr.readAsBinaryString(file);
  }

  function uploadFile(file, exif, done){
    var fd = new FormData();
    var blob = dataURItoBlob(file.thumbnail);
    //blob.filename = file.filename;
    fd.append('exif', exif);
    //fd.append('original|'+ (exif && exif.DateTime) +'|'+file.size, file);
    fd.append('thumbnail' + '|' + (exif && exif.DateTime) + '|' + blob.size, blob);

    var xhr = new XMLHttpRequest();
    xhr.timeout = 10 * 60 * 1000;
    xhr.open("POST", "/api/upload", true);

    xhr.onload = function() {
      if(this.status !== 200){
        file.state = 'Error';
        file.error = xhr.responseText;
        file.progress = 30;
        $scope.errorSize += file.size;
        return done(file.error, file);
      } else {
          var response = xhr.responseText;
          file.response = response;
          file.state = 'Done';
          file.progress = 100;
          $scope.library = null;
          $scope.doneSize += file.size;
          var photo = JSON.parse(response);

          delete file.thumnail; // save memory
          delete file.exif;
          return done(null, file, photo);
      }
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

    file.progress = 1;
    xhr.send(fd);
  }


  function generateThumbnail(file, options, done){
    file.thumbnail = null;

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

          file.thumbnail = canvas.toDataURL('image/jpeg');
          if (done) return done(null, file);

//          file.thumbnail = canvas.toDataURL("image/jpeg");
          if (done) return done(null, file);
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
 