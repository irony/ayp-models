var should = require("should");
var app = require('../app');
var async = require('async');

describe("app", function(){

  var id = Math.floor((Math.random()*10000000)+1).toString();

  it("should be possible to create a user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test', id : id};
	var user = null;
    app.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err);
		savedUser.should.have.property('accounts');
		done();
    });
  });

  it("should be possible to add new email to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cln@iteam.se'], provider : 'test', id : id};
	var user = null;
    app.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	should.ok(!err);
		savedUser.emails.should.have.length(2);
		done();
    });
  });

  it("should be possible to add new account to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test2', id : id};
	var user = null;
    app.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
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
          startDate: new Date()-100000000,
          stopDate: new Date()+1000000000,
          members : [userA, userB]
        });

        shareSpan.save(function(err, span){

          ShareSpan.find({
            startDate: { $lt : new Date() },
            stopDate: { $gt : new Date() },
            members : { $in: userA }
          }, function(err, spans){
            should.exist(spans);
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
          startDate: new Date()-100000000,
          stopDate: new Date()+10000000,
          members : [userA, userB]
        });

        shareSpan.save(function(err, span){

            console.log('Saved sharespan', shareSpan);
            var photo = new Photo({
              taken : new Date()-1000,
              owners : [userA]
            });

            photo.save(function(err, photo){


              photo.owners.should.include(userA, "UserA does not exist");

              Photo.findOne({owners: userB}, function(err, photo) {
                // TODO: Fix this test.. ;)
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
