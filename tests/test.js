var should = require("should");
var auth = require('../server/auth/auth');
var async = require('async');
var app = require('../server/app');

// disgard debug output
console.debug = function(){};

describe("worker", function(){

  var id = Math.floor((Math.random()*10000000)+1).toString();


  it("should be possible to start ranking job", function(done){
    this.timeout(10000);
    require('../jobs/updateRank')(function(err, result){
      should.ok(!err);
      done(err);
    });
  });


  it("should be possible to start calculate interestingness job", function(done){
    this.timeout(15000);
    require('../jobs/calculateInterestingness')(function(err, result){
      should.ok(!err);
      done();
    });
  });

  it("should be possible to start downloading photos job", function(done){
    this.timeout(40000);
    require('../jobs/downloader').downloadNewPhotos(function(err, result){
      should.ok(!err);
      done();
    });
  });

});

describe("app", function(){

  var id = Math.floor((Math.random()*10000000)+1).toString();

  it("should be possible to create a user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test', id : id};
	var user = null;
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err);
		savedUser.should.have.property('accounts');
		done();
    });
  });

/*  it("should be possible to add new email to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cln@iteam.se'], provider : 'test', id : id};
	var user = null;
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err); 
		savedUser.emails.should.have.length(2);
		done();
    });
  });*/

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
