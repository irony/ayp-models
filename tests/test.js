var conf = require('../conf');
conf.mongoUrl = process.env.MONGOHQ_URL || 'mongodb://localhost/allyourphotos_test';
var should = require("should");
var mongoose = require('mongoose');
var auth = require('../server/auth/auth');
var async = require('async');
var app = require('../server/app').init();
var User = require('../models/user');
var Photo = require('../models/photo');
var request = require('supertest');
var importer = require('../jobs/importer');
var io = require('socket.io-client');
var socketURL = 'http://0.0.0.0:3000/photos';

var addedUsers = [];
var addedPhotos = [];
var addedSpans = [];

app.listen(3000);

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


  describe("account", function(){


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
          savedUser.accounts.should.have.property('test');
      		savedUser.accounts.should.have.property('test2');
      		done();
        });
    });

  });

  describe("share", function(){

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
  });


  describe("importer", function(){


    it('should be able to import new properties to an existing photo', function(done){
      
      var taken = new Date();
      var size = Math.floor(Math.random()*30000);
      var userA = new User();

      var photoA = new Photo({
        taken : taken,
        bytes: size,
        ratio : 1.5,
        owners : [userA]
      });

      addedPhotos.push(photoA);

      photoA.save(function(err, photoAsaved){

        should.not.exist(err, "error when saving photoA", err);


        var photoB = new Photo({
          taken : taken,
          bytes: size,
          store : {thumbnails : {url:'test'}}
        });
      
        importer.findOrInitPhoto(userA, photoB, function(err, photo){
          if (err)
          should.not.exist(err, "error when initing photo", err);

          photo.taken.toString().should.equal(photoA.taken.toString());
          
          photo.should.have.property('store');
          photo.should.have.property('ratio', 1.5);
          photo.store.should.have.property('thumbnails');
          photo.store.thumbnails.should.have.property('url');
          // TODO: check thhat owners are not changed
          done();
        });
      });
    });


    it("should be possible to add a photo which already exists and resulting in two owners of the existing photo.", function(done){

      var Photo = require('../models/photo');

      var userA = new User();
      var userB = new User();

      addedUsers.push(userA);
      addedUsers.push(userB);

      var taken = new Date();
      var size = Math.floor(Math.random()*30000);

      userA.save(function(err, userA){
        should.not.exist(err, "Error when saving user A", err);
        userB.save(function(err, userB){

          should.not.exist(err, "Error when saving user B", err);

          var photoA = new Photo({
            taken : taken,
            bytes: size,
            owners : [userA] // only one user
          });

          addedPhotos.push(photoA);

          photoA.save(function(err, photo){

            should.not.exist(err, "error when saving photoA", err);

            photo.owners.should.include(userA._id, "UserA does not exist", err);

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
                savedPhoto.owners.should.include(userA._id, "UserA does not exist before saving");
                savedPhoto.owners.should.include(userB._id, "UserB does not exist before saving");

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



    });


    describe("uploader", function(){
      var cookie;

      var d = new Date().toISOString().replace('T', ' ').slice(0, -5);
      // weird dates in exif standards..
      var taken = d.slice(0, 10).split('-').join(':') + ' ' + d.slice(11);

      beforeEach(function(done) {
        var random = Math.random() * 1000000;
        request(app)
        .post('/register')
        .send({username: 'test' + random, password:'test'})
        .expect(200)
        .end(function(err, res) {
          request(app)
          .post('/login')
          .send({username: 'test' + random, password:'test'})
          .expect(200)
          .end(function(err, res) {
            res.headers.should.have.property('set-cookie');
            cookie = res.headers['set-cookie'];
            done();
          });
        });
      });

     

      it("should be able to upload a photo", function(done) {
        var req = request(app)
        .post('/api/upload');
        
        req.cookies = cookie;
        this.timeout(20000);

        req
        .attach('thumbnail|' + taken + '|35260', 'tests/fixtures/couple.jpg')
        .expect(200)
        .end(function(err, res){
          should.not.exist(err);

          var photo = res.body;
          should.not.exist(err);
          should.exist(photo, "uploaded photo could not be found" + d + ' ' + taken);

          // photo.should.have.property('ratio', 1.5, 'ratio was not set');
          photo.should.have.property('store');
          photo.store.should.have.property('thumbnails');
          photo.store.thumbnails.should.have.property('url');


          Photo.findOne({_id : photo._id}, function(err,photo){
            should.exist(photo, "uploaded photo could not be found in database");
            should.not.exist(err);
            addedPhotos.push(photo);
            done(err);
          });

        });
      });
      

      it("should be able to upload a photo with both original and thumbnail", function(done) {
        var req = request(app)
        .post('/api/upload');
        
        req.cookies = [cookie];
        this.timeout(20000);

        req
        .attach('original|' + taken + '|198184', 'tests/fixtures/IMG_3298.JPG')
        .attach('thumbnail|' + taken + '|78443', 'tests/fixtures/IMG_3298_thumbnail.jpg')
        .expect(200)
        .end(function(err, res){

          var photo = res.body;
          should.not.exist(err);
          should.exist(photo, "uploaded photo could not be found");

          photo.should.have.property('exif');
          photo.should.have.property('ratio', 1.5, 'ratio was not correct');
          photo.should.have.property('store');
          photo.store.should.have.property('thumbnails');
          photo.store.thumbnails.should.have.property('url');

          photo.store.should.have.property('originals');
          photo.store.originals.should.have.property('url');


          Photo.findOne({_id : photo._id}, function(err,photo){
            should.exist(photo, "uploaded photo could not be found in database");
            should.not.exist(err);
            addedPhotos.push(photo);
            done(err);
          });

        });
      });


    });
  });
  
  describe("socket communication", function(){
    var options ={
      transports: ['websocket'],
      'force new connection': true
    };

    var photoA;
    var userId;
    var cookie;

    beforeEach(function(done){
      photoA = new Photo({
        taken : new Date(),
        bytes: 1337,
        ratio : 1.5
      });

      addedPhotos.push(photoA);

      var random = Math.random() * 1000000;
      request(app)
      .post('/register')
      .send({username: 'test' + random, password:'test'})
      .expect(200)
      .end(function(err, res) {
        request(app)
        .post('/login')
        .send({username: 'test' + random, password:'test'})
        .expect(200)
        .end(function(err, res) {
          res.headers.should.have.property('set-cookie');
          cookie = res.headers['set-cookie'];
          res.headers.should.have.property('user-id');
          userId = res.headers['user-id'];

          /*
           *  First we will patch the xmlhttprequest library that socket.io-client uses
           *  internally so we can monkey-patch in our own session-cookie
           */
          var originalRequest = require('xmlhttprequest').XMLHttpRequest;
          require('socket.io-client/node_modules/xmlhttprequest').XMLHttpRequest = function(){
            originalRequest.apply(this, arguments);
            this.setDisableHeaderCheck(true);
            var stdOpen = this.open;
            this.open = function() {
              stdOpen.apply(this, arguments);
              this.setRequestHeader('cookie', cookie);
            };
          };

          photoA.owners = [userId];
          photoA.save(done);

        });
      });
    });


    it("should be possible to connect to socket io",function(done){
        var client1 = io.connect(socketURL, options);
        client1.on('connect', function(data){
          done();
        });
    });

    it("should be possible to vote on a photo",function(done){
        var client1 = io.connect(socketURL, options);

        client1.on('connect', function(data){
          should.not.exist(data);
          /* Since first client is connected, we connect
          the second client. */
          var client2 = io.connect(socketURL, options);

          client2.on('connect', function(){
            client2.on('vote', function(photoId, value){
              photoA._id.toString().should.eql(photoId);
              value.should.eql(5);
              Photo.findById(photoId, function(err, photo){
                photo.copies.should.have.property(userId);
                photo.copies[userId].vote.should.eql(value);
                done();
              });
            });
            client1.emit('vote', photoA._id, 5);
          });
        });
    });

    it("should be able to login with express and read the user from socket.io", function (done) {
      done();
      
    });


  });

  after(function(){

    addedUsers.map(function(item){return item.remove()});
    addedPhotos.map(function(item){return item.remove()});
    addedSpans.map(function(item){return item.remove()});

    User.find({$exists: 'accounts.test'}).limit(1000).remove();

    User.find({emails: 'test@stil.nu'}).limit(1000).remove();
    User.find({displayName: 'Test Landgren'}).limit(1000).remove();

    //console.log("after step")
  });

});
