var should = require("should");
var app = require('../app');
var auth = require('../auth/auth');
var async = require('async');
var PathReducer = require('../utils/PathReducer');

describe("app", function(){

  var id = Math.floor((Math.random()*10000000)+1).toString();

  it('should return a toplist from a list of files', function(done){
    var files = ['/foo/bar.jpg', '/foo/bar/foo.jpg', '/foo/bars.jpg', '/foo/var.doc'];
    var reduced = new PathReducer().reduce(files);
    console.log(reduced);
    reduced.should.have.length(2);
    done();
  })

  it("should be possible to create a user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test', id : id};
	var user = null;
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err);
		savedUser.should.have.property('accounts');
		done();
    });
  });

  it("should be possible to add new email to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cln@iteam.se'], provider : 'test', id : id};
	var user = null;
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err);
		savedUser.emails.should.have.length(2);
		done();
    });
  });

  it("should be possible to add new account to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test2', id : id};
	var user = null;
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err);
		savedUser.should.have.property('accounts');
		savedUser.accounts.should.have.property(profile.provider);
		done();
    });
  });






  it("should be possible to add a span, and find it with a date", function(done){

    var ShareSpan = require('../models/sharespan');
    var User = require('../models/user');


    var userA = new User();
    var userB = new User();

    userA.save(function(err, userA){
      userB.save(function(err, userB){
        var shareSpan = new ShareSpan({
          startDate: new Date(new Date().getTime()-1000),
          stopDate: new Date(new Date().getTime()+1000),
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

    var Photo = require('../models/photo');
    var ShareSpan = require('../models/sharespan');
    var User = require('../models/user');


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

console.log('photo saved, err', err)
        debugger;

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
  
  after(function(){
    //console.log("after step")
  });

});
