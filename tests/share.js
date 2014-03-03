// run tests locally or with test collection
var nconf = require('nconf');


nconf.overrides({
  mongoUrl : 'mongodb://localhost/ayp-test'
});

nconf
  .env() // both use environment and file
  .file({file: 'config.json', dir:'../../', search: true});

var Models = require('../').init();
var User = Models.user;
var Photo = Models.photo;
var ShareSpan = Models.sharespan;
var auth = Models.auth;
var should = require('should');


// disgard debug output
console.debug = function(){};


describe("share", function(){

    it("should be possible to add a span, and find it with a date", function(done){


      var userA = new User();
      var userB = new User();


      userA.save(function(err, userA){
        userB.save(function(err, userB){
          var shareSpan = new ShareSpan({
            startDate: new Date(new Date().getTime()-50000),
            stopDate: new Date(new Date().getTime()+50000),
            members : [userA, userB]
          });
      


          shareSpan.save(function(err, span){
            should.not.exist(err);

            ShareSpan.find({
              startDate: { $lt : new Date() },
              stopDate: { $gt : new Date() },
              members : { $in : [userA, userB]}
            }, function(err, spans){
              should.exist(spans, 'no share spans found');
              done();
            });

          });
        });

      });


    });

    it("should be possible to add a span, a photo and get multiple owners of the photo", function(done){

      var userA = new User();
      var userB = new User();


      userA.save(function(err, userA){
        userB.save(function(err, userB){
          var shareSpan = new ShareSpan({
            startDate: new Date(new Date().getTime()-10000),
            stopDate: new Date(new Date().getTime()+10000),
            members : [userA, userB]
          });


          shareSpan.save(function(err, span){

              var photo = new Photo({
                taken : new Date(),
                owners : [userA] // only one user
              });


              photo.save(function(err, photo){

                photo.owners.should.include(userA._id, "UserA does not exist");

                // since we have a sharespan with userB it should be added here by the middleware
                photo.owners.should.include(userB._id, "UserB does not exist");

                Photo.findOne({owners: userB}, function(err, photo) {
                  should.not.exist(err);
                  should.exist(photo);
                  done();
                });

              });

          });
        });

      });

    });

  });
