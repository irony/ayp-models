function PathReducer(files){
  
}

PathReducer.prototype.reduce = function(files){
  var dirs = files.map(function(file){
          var path = file.split('/');
          path = path.splice(0, path.length-1).join('/') + '/';

          var extension = file.split('.').pop();
          switch(extension){
            case 'mov'  :
            case 'avi'  :
            case 'png'  :
            case 'tif'  :
            case 'tiff' :
            case 'jpg'  :
            case 'jpeg' : return {path:path, count : 1 };
          }
          return null;
        }).reduce(function(a,b){
          if(b && !a.some(function(path){
            if (path && path.path === b.path) {
              path.count++;
              return true;
            } else {
              return false;
            }
          }))
          {
            a.push(b);
          }

          return a;
        }, []).sort(function(a,b){
          return b.count - a.count;
        });
  return dirs;
};

module.exports = PathReducer;