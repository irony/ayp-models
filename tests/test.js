var conf = require('../conf');
var should = require("should");
var mongoose = require('mongoose');
var auth = require('../server/auth/auth');
var async = require('async');
var app = require('../server/app').init();
var User = require('../models/user');
var Photo = require('../models/photo');
var request = require('supertest');
var importer = require('../jobs/importer');

var addedUsers = [];
var addedPhotos = [];
var addedSpans = [];

var stop = true;
//mongoose.connect(config.db.test, function (err) {
mongoose.connect(conf.mongoUrl, function(err){
  stop = false;
});

while(stop) {
  process.nextTick(function(){
    // wait
  });
}

require('nodetime');

// disgard debug output
console.debug = function(){};
/*
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

});*/



describe("app", function(){


  var id = Math.floor((Math.random()*10000000)+1).toString();

  it("should be possible to create a user ", function(done) {
	  var profile = {displayName : 'Test Landgren', emails : ['test@stil.nu'], provider : 'test', id : id};
	  var user = null;
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
      should.ok(!err);
		  savedUser.should.have.property('accounts');
		  done();
    });
  });

 it("should be possible to add new email to an existing user ", function(done) {
    var profile = {displayName : 'Test Landgren', emails : ['testing@stil.nu'], provider : 'test', id : id};
    var user = null;
    
    auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
      should.ok(!err);
		  savedUser.emails.should.have.length(2);
		  done();
    });
  });

  it("should be possible to add new account to an existing user ", function(done) {
  	var profile = {displayName : 'Test Landgren', emails : ['test@stil.nu'], provider : 'test2', id : id};
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

    addedUsers.push(userA);
    addedUsers.push(userB);

    userA.save(function(err, userA){
      userB.save(function(err, userB){
        var shareSpan = new ShareSpan({
          startDate: new Date(new Date().getTime()-50000),
          stopDate: new Date(new Date().getTime()+50000),
          members : [userA, userB]
        });
    
        addedSpans.push(shareSpan);


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


    var userA = new User();
    var userB = new User();

    addedUsers.push(userA);
    addedUsers.push(userB);

    userA.save(function(err, userA){
      userB.save(function(err, userB){
        var shareSpan = new ShareSpan({
          startDate: new Date(new Date().getTime()-10000),
          stopDate: new Date(new Date().getTime()+10000),
          members : [userA, userB]
        });

        addedSpans.push(shareSpan);

        shareSpan.save(function(err, span){

            var photo = new Photo({
              taken : new Date(),
              owners : [userA] // only one user
            });

            addedPhotos.push(photo);

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

  it("should be possible to add a new photo which already exists and resulting in two owners of the existing photo.", function(done){

    var Photo = require('../models/photo');

    var userA = new User();
    var userB = new User();

    addedUsers.push(userA);
    addedUsers.push(userB);

    var taken = new Date();
    var size = Math.floor(Math.random()*30000);

    userA.save(function(err, userA){
      should.not.exist(err, "Error when saving user A");
      userB.save(function(err, userB){

        should.not.exist(err, "Error when saving user B");

        var photoA = new Photo({
          taken : taken,
          bytes: size,
          owners : [userA] // only one user
        });

        addedPhotos.push(photoA);

        photoA.save(function(err, photo){

          should.not.exist(err, "error when saving photoA");

          photo.owners.should.include(userA._id, "UserA does not exist");

          var photoB = new Photo({
            taken : taken,
            bytes: size,
            owners : [userB] // only one user
          });
        
          importer.findOrInitPhoto(userB, photoB, function(err, photoB){


            photoB.taken.should.equal(taken);

            addedPhotos.push(photoB);
            should.not.exist(err);

            photoB.save(function(err, savedPhoto){

              should.not.exist(err, "error when saving photoB");

              // since we already have a photo with this taken date we will add users to it
              Photo.findOne({_id: photoA._id}, function(err, photo) {
                photo.owners.should.include(userA._id, "UserA does not exist");
                photo.owners.should.include(userB._id, "UserB does not exist");
                should.not.exist(err);
                should.exist(photo);
                done();
              });
            });
          });

        });
      });

    });

    it('should be able to import new properties to an existing photo', function(done){
      
      var taken = new Date();
      var size = Math.floor(Math.random()*30000);
      var userA = new User();

      var photoA = new Photo({
        taken : taken,
        bytes: size
      });

      addedPhotos.push(photoA);

      photoA.save(function(err, photo){

        should.not.exist(err, "error when saving photoA");


        var photoB = new Photo({
          taken : taken,
          bytes: size,
          store : {thumbnails : {url:'test'}}
        });
      
        importer.findOrInitPhoto(userA, photoB, function(err, photo){
          if (err)
          should.not.exist(err, "error when initing photo");

          photo.taken.toString().should.equal(photoA.taken.toString());
          
          photo.should.have.property('store');
          photo.store.should.have.property('thumbnails');
          photo.store.thumbnails.should.have.property('url');

        });
      });
    });


  });


  describe("uploader", function(){
    var cookie;

    beforeEach(function(done) {
      request(app)
        .post('/login')
        .send({username: 'test', password:'test'})
        .expect(200)
        .end(function(err, res) {
          res.headers.should.have.property('set-cookie');
          cookie = res.headers['set-cookie'];
          done();
        });
    });

   
    it("should be able to upload a photo", function(done) {
      var req = request(app)
      .post('/api/upload');
      
      req.cookies = cookie;
      this.timeout(20000);

      req.attach('thumbnail|2013:01:01 00:00:00|35260', 'tests/fixture/couple.jpg')
      .expect(200)
      .end(function(err, res){

        Photo.findOne({taken: new Date('2013-01-01 00:00:00'), bytes: 35260}, function(err, photo) {
          should.not.exist(err);
          should.exist(photo);

          photo.should.have.property('store');
          photo.store.should.have.property('thumbnails');
          photo.store.thumbnails.should.have.property('url');

          addedPhotos.push(photo);

          done(err);
        });
      });
    });
    

    it("should be able to upload a photo with both original and thumbnail", function(done) {
      var req = request(app)
      .post('/api/upload');
      
      req.cookies = cookie;
      this.timeout(20000);

      req
      .attach('original|2013:02:01 00:00:00|35260', 'tests/fixture/couple.jpg')
      .attach('thumbnail|2013:02:01 00:00:00|35260', 'tests/fixture/couple.jpg')
      .expect(200)
      .end(function(err, res){

        Photo.findOne({taken: new Date('2013-01-01 00:00:00'), bytes: 35260}, function(err, photo) {
          should.not.exist(err);
          should.exist(photo);

          photo.should.have.property('store');
          photo.store.should.have.property('thumbnails');
          photo.store.thumbnails.should.have.property('url');

          photo.store.should.have.property('originals');
          photo.store.originals.should.have.property('url');

          addedPhotos.push(photo);

          done(err);
        });
      });
    });


  });

  
  after(function(){

    addedUsers.map(function(item){return item.remove()});
    addedPhotos.map(function(item){return item.remove()});
    addedSpans.map(function(item){return item.remove()});

    User.find({$exists: 'accounts.test'}).limit(1000).remove();
    //User.find({emails: {$size : 0}}).limit(1000).remove();

    //console.log("after step")
  });

});
