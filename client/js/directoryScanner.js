var files;
var worker = this;

this.addEventListener('message', function(e) {

    var length = e.dataTransfer.items.length;

    for (var i = 0; i < length; i++) {
      var entry = e.items[i].webkitGetAsEntry();
      var file = e.files[i];
      var zip = file.name.match(/\.zip/);
      if (entry.isFile) {
        if(file.type.match(/image\.*/)){
          worker.postMessage(file);
        }
      } else if (entry.isDirectory) {
        traverseFileTree(entry, null, addFile);
      }
    }
}, false);


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
      for(var i = 0; i<entries.length; i++){
        var entry = entries[i];
        traverseFileTree(entry, path + item.name + "/", callback);
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