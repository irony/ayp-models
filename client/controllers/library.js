appProvider.factory('library', function($http, socket, storage){
  console.log('library factory')
  var server;
  var photos = [];

  var library = {

    listeners : [],
    meta : {},
    propagateChanges : function(photos){
      console.log('propagateChanges')
      library.listeners.map(function(fn){
        fn(photos);
      });
    },

    // load all photos based on modify date. It means we can fill up the library on newly changed
    // photos or recently added photos without loading the whole library again.
    loadLatest : function(modified, done){
          console.log('latest ', modified);

      $http.get('/api/library', {params: {modified:modified}, cache: true})
      .success(function(page){
          console.log('latest page', page);

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
        }, photos || []);

        // next is a cursor to the next date in the library
        if (page.next){
          console.log('next latest', page.next);
          return library.loadLatest(page.next, done);
        } else{
          // THE END
          console.log('done latest', page.modified);
          library.meta.modified = page.modified;
          return done && done(null, photos);
        }

      })
      .error(function(err){
        console.log('library error', err);
        return done(err);
      });

    },
    find : function(taken){
      var photo = _.first(library.photos, {'taken' : new Date(taken).getTime()});
      return photo;
    },
    // Load library based on photo taken, this will recurse until it reaches the end of the library
    loadMore: function(taken, done){
      $http.get('/api/library', {params: {taken:taken || new Date().getTime() }, cache: true})
      .success(function(page){
        console.log('more success', page);
        if (!page || !page.photos || !page.photos.length) return done && done();

        if (library.meta.userId !== page.userId || !photos){
          library.photos =[];          
          library.meta = {userId : page.userId }; // reset if we are logged in as new user
        }


        // if (_.find(photos, {taken:page.photos[0].taken})) return done && done();

        _.each(page.photos, function(photo){
          photo.src=photo.src && photo.src.replace('$', page.baseUrl) || null;
          library.photos.push(photo);
        });

        // next is a cursor to the next date in the library
        if (page.next || !taken){
          if (_.any(photos, {taken:page.next})) return done && done(null, page.photos);
          console.log('next more', page.next);
          library.loadMore(page.next, done);
        } else{
          console.log('done more', page.modified);
          library.meta.modified = page.modified;

          return done && done(null, page.photos);
        }

      })
      .error(function(err){
        console.log('library error', err);
        return done(err);
      });
    },
    sortAndRemoveDuplicates: function(){
      library.photos.sort(function(a,b){
          return b.taken - a.taken;
      });

      var i = library.photos.length;
      while (i--) {
        if (i && library.photos[i-1].taken === library.photos[i].taken) {
          library.photos.splice(i,1);
        }
      }
    },
    init:function(){

      library.meta = storage.getObject('meta') || {modified:null, userId:null}; 
      library.photos = library.photos || [];


      if (window.shimIndexedDB) window.shimIndexedDB.__useShim();

      async.series({
        db : function(done){
          console.log('__db');
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
              console.log('db done', photos);

              photos = photos.reverse();
              library.propagateChanges(photos); // prerender with the last known library if found
              // descending order
              library.photos.concat(photos);
              done(null, photos);
            });
          });
        },
         beginning : function(done){
          console.log('__beginning');
          library.loadMore(null, function(err, photos){
            library.propagateChanges(photos); // prerender with the last known library if found
            done(err, photos);
          });
        },
        changes : function(done){
          console.log('__changes');
          var lastModifyDate = library.meta.modified && new Date(library.meta.modified).getTime() || null;
          if (lastModifyDate){
            library.loadLatest(lastModifyDate, done);
          }
          else done();
        },
        end : function(done){
          console.log('__end');
          var lastPhoto = (library.photos || []).slice(-1)[0];
          library.loadMore(lastPhoto && lastPhoto.taken || new DateTime(), done);
        }
      }, function(err, result){
        console.log('__result', result);

        library.sortAndRemoveDuplicates();
        library.propagateChanges(library.photos);

        storage.setObject('meta', library.meta);
        if (server) {
          server.photos.update.call(library.photos); // update means put == insert or update
        } else {
          // load every time as fallback
        }
      });
     }

  };


  socket.on('connect', function(data){
    socket.on('trigger', function(trigger){

      var photo = library.find(new Date(trigger.item.taken).getTime());

      if (photo){
        angular.extend(photo, trigger.item); // update existing
      }
      else{
        library.photos.push(trigger.item); // add
      }


    });
  });

  return library;
  //initialize();
})