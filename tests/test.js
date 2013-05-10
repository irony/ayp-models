var conf = require('../conf');

// run tests locally or with test collection
conf.mongoUrl = (process.env.MONGOHQ_URL || 'mongodb://localhost/allyourphotos') + '_test';


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
var fs = require('fs');

var addedUsers = [];
var addedPhotos = [];
var addedSpans = [];

var port = 3333;
var host = 'http://0.0.0.0:' + port;
// app.listen(port);



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

  before(function(){
    conf.mongoUrl.slice(-4).should.eql('test');

    User.find().remove();
    Photo.find().remove();

  });


  describe("account", function(){


    var id = Math.floor((Math.random()*10000000)+1).toString();
    var email = Math.random()+'test@stil.nu';
    var user;

    before(function(done) {
  	  var profile = {displayName : 'Test Landgren', emails : [email], provider : 'test', id : id};
      auth.findOrCreateAndUpdateUser(null, profile, function(err, savedUser){
        should.not.exist(err, 'error save ' + err);
        should.exist(savedUser);
  		  savedUser.should.have.property('accounts');
        user = savedUser;
  		  done();
      });
    });

   it("should be possible to add new email to an existing user ", function(done) {
      var profile = {displayName : 'Test Landgren', emails : ['testing@stil.nu'], provider : 'test', id : id};
      
      auth.findOrCreateAndUpdateUser(null, profile, function(err, savedUser){
        should.ok(!err);
  		  savedUser.emails.should.have.length(2);
        savedUser.emails[0].should.eql(email);
        savedUser.emails[1].should.eql('testing@stil.nu');
  		  done();
      });
    });

    it("should be possible to add new account to an existing user ", function(done) {
    	var profile = {displayName : 'Test Landgren', emails : [email], provider : 'test2', id : id};
        auth.findOrCreateAndUpdateUser(null, profile, function(err, savedUser){
          should.ok(!err);
      		savedUser.should.have.property('accounts');
          savedUser.accounts.should.have.property('test');
      		savedUser.accounts.should.have.property('test2');
      		done();
        });
    });

    it("should be possible to add new account to a logged-in user ", function(done) {
      var profile = {displayName : 'Test Landgren', emails : [], provider : 'test3', id : id+1};
        auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
          should.ok(!err);
          savedUser.should.have.property('accounts');
          savedUser.accounts.should.have.property('test');
          savedUser.accounts.should.have.property('test3');
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

/*
  describe("library", function(){

    before(function(){

    });

    it('should be able to get the correct amount of total numbers of photos', function(done){
    });

    it('should be able to get all photos in the library');

  });*/


  describe("connectors", function(){
    var user = new User(JSON.parse(fs.readFileSync(__dirname + '/fixtures/testUser.json')));
    
    before(function(done){
      user.save(done);
    });

    describe("dropbox", function(){
      var connector = require('../server/connectors/dropbox');
      var client = connector.getClient(user);
      var testPhoto = fs.readFileSync(__dirname + '/fixtures/couple.jpg');
      
      this.timeout(20000);


      it("should be able to upload test file manually", function(done){

        client.put("fixtures/couple.jpg", testPhoto, function(status, reply){
          status.should.eql(200);
          reply.should.have.property("path", "/fixtures/couple.jpg");
          done();
        });

      });


      it("should be able to upload a large test file manually", function(done){
        var largePhoto = fs.readFileSync(__dirname + '/fixtures/IMG_5501.JPG');

        client.put("fixtures/IMG_5501.JPG", largePhoto, function(status, reply){
          status.should.eql(200);
          reply.should.have.property("path", "/fixtures/IMG_5501.JPG");
          done();
        });

      });

      it("should be able to import all photos under fixtures", function(done){

        client.put("fixtures/couple.jpg", testPhoto, function(status, reply){
          status.should.eql(200);
          reply.should.have.property("path", "/fixtures/couple.jpg");
          done();
        });

      });

      it("should import", function(done){

        connector.importNewPhotos(user, function(err, photos){
          if (err) throw err;
          var photo = photos.pop();
          importer.findOrInitPhoto(user, photo, function(err, photo){
            should.not.exist(err);

            async.series({
              thumbnail: function(done){
                connector.downloadThumbnail(user, photo, function(err, photo){
                  should.not.exist(err);
                  should.exist(photo);
                  should.exist(photo.store);
                  photo.store.should.have.property('thumbnail');
                  photo.store.thumbnail.should.have.property('url');
                  done();
                });
              },
              original: function(done){
                connector.downloadOriginal(user, photo, function(err, photo){
                  should.not.exist(err);
                  should.exist(photo);
                  should.exist(photo.store);
                  should.exist(photo.ratio);
                  photo.store.should.have.property('original');
                  photo.store.original.should.have.property('url');
                  //photo.ratio.should.eql(1.57790262172284643);
                  done();
                });
              }
            }, function(err, result){
              done();
            });
                
          });
        });

      });


      after(function(done) {
        client.rm("fixtures", function(status, reply){
          status.should.eql(200);
          reply.should.have.property("path", "/fixtures");
          done();
        });

        user.remove();

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
          store : {thumbnail : {url:'test'}}
        });
      
        importer.findOrInitPhoto(userA, photoB, function(err, photo){
          if (err)
          should.not.exist(err, "error when initing photo", err);

          photo.taken.toString().should.equal(photoA.taken.toString());
          
          photo.should.have.property('store');
          photo.should.have.property('ratio', 1.5);
          photo.should.have.property('src');
          photo.store.should.have.property('thumbnail');
          photo.store.thumbnail.should.have.property('url');
          photo.src.should.equal(photo.store.thumbnail.url);
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

      before(function(done) {
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

      it("should exist a cookie", function(){
        should.exist(cookie);
      });

      it("should be able to upload a photo", function(done) {
        var req = request(app)
        .post('/api/upload')
        .set('cookie', cookie)
        .attach('thumbnail|' + taken + '|35260', 'tests/fixtures/couple.jpg')
        .expect(200)
        .end(function(err, res){
          if (err) done(err);

          should.not.exist(err);

          var photo = res.body;
          should.not.exist(err);
          should.exist(photo, "uploaded photo could not be found" + d + ' ' + taken);

          // photo.should.have.property('ratio', 1.5, 'ratio was not set');
          photo.should.have.property('store');
          photo.store.should.have.property('thumbnail');
          photo.store.thumbnail.should.have.property('url');


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
          photo.should.have.property('path');
          photo.store.should.have.property('thumbnail');
          photo.store.thumbnail.should.have.property('url');

          photo.store.should.have.property('original');
          photo.store.original.should.have.property('url');

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

  describe("redis pubsub", function(){
    it("should be able to publish and subscribe to a user channel", function(done){
      var redis = require('redis');
      var client1 = redis.createClient();
      var client2 = redis.createClient();

      client1.subscribe(1337);
      client1.on('message', function(channel, message){
        var trigger = JSON.parse(message);
        channel.should.equal("1337");
        trigger.should.have.property('action', 'save');
        trigger.should.have.property('type', 'photo');
        trigger.item.should.have.property('_id');
        done();
      });
      client2.publish(1337, JSON.stringify({action:'save', type:'photo', item : new Photo()}));
      // verify that the next message isn't parsed by the first channel
      client2.publish(1338, JSON.stringify({action:'save', type:'photo', item : new Photo()}));


    });
  });
  
  describe("socket communication", function(){
    var options ={
      transports: ['websocket'],
      'force new connection': true
    };

    app.listen(port);

    var photoA;
    var photoB;
    var userId;
    var cookie;
    var socketURL = host;

    beforeEach(function(done){
      photoA = new Photo({
        taken : new Date(),
        bytes: 1337,
        ratio : 1.5
      });

      photoB = new Photo({
        taken : new Date(),
        bytes: 1331,
        ratio : 1.5,
        owners : [new User()._id]
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
          socketURL = 'http://0.0.0.0:3000/';

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
          photoB.save();

        });
      });
    });


    it("should be possible to connect to socket io",function(done){
        var client1 = io.connect(socketURL, options);
        client1.once('connect', function(data){
          done();
          client1.disconnect();
        });
    });

    it("should be possible to vote on a photo",function(done){
        var client1 = io.connect(socketURL, options);

        client1.once('connect', function(data){
          should.not.exist(data);
          var client2 = io.connect(socketURL, options);

          client2.once('connect', function(){
            client2.once('vote', function(photoId, value){
              photoA._id.toString().should.eql(photoId);
              value.should.eql(5);
              Photo.findById(photoId, function(err, photo){
                photo.copies.should.have.property(userId);
                photo.copies[userId].vote.should.eql(value);
                done();
                client1.disconnect();
                client2.disconnect();
              });
            });
            client1.emit('vote', photoA._id, 5);
          });
        });
    });


    it("should not be possible to affect another user's photo",function(done){
        var client1 = io.connect(socketURL, options);

        client1.once('connect', function(data){
          client1.once('error', function(err){
            done();
            client1.disconnect();
          });
          client1.emit('click', photoB._id);
        });
    });

    it("should be able to add a photo and receive notification", function (done) {
      
       // create a new photo
      var photo = new Photo({
        taken : new Date(),
        bytes : Math.round(Math.random()*1000000),
        store : {thumbnail:{url:'http://placehold.it/100x100.jpg'}},
        owners : [userId]
      });

      addedPhotos.push(photo);

      // listen to new changes
      var client1 = io.connect(socketURL, options);
      client1.once('connect', function(data){
        client1.on('trigger', function(trigger){
          if (trigger.item.bytes !== photo.bytes) return;

          trigger.type.should.eql("photo");
          trigger.action.should.eql("save");
          trigger.item.bytes.should.eql(photo.bytes);
          done();
          client1.disconnect();
        });

        // save it
        photo.save(function(err, photo){
          should.not.exist(err);
        });
      });
    });


    it("should be able to add a photo to another user and not receive a notification", function (done) {
      
       // create a new photo
      var photo = new Photo({
        taken : new Date(),
        bytes : Math.round(Math.random()*1000000),
        store : {thumbnail:{url:'http://placehold.it/100x100.jpg'}},
        owners : [new User()._id] // someone else
      });

      addedPhotos.push(photo);
      this.timeout = 200;

      // listen to new changes
      var client1 = io.connect(socketURL, options);
      client1.once('connect', function(data){
        var triggered = false;
        client1.once('trigger', function(trigger){
          triggered = true;
        });
        setTimeout(function () {
          triggered.should.be.false;
          done();
        }, 500);
      });

      // save it
      photo.save();

     


    });

  });

  after(function(){

    addedUsers.map(function(item){return item.remove()});
    addedPhotos.map(function(item){return item.remove()});
    addedSpans.map(function(item){return item.remove()});

    User.find({$exists: 'accounts.test'}).limit(1000).remove();
    Photo.update({$rename : {'store.originals':'store.original'}});
    Photo.update({$rename : {'store.thumbnails': 'store.thumbnail'}});
    User.find({emails: 'test@stil.nu'}).limit(1000).remove();
    User.find({displayName: 'Test Landgren'}).limit(1000).remove();

    //console.log("after step")
  });

});
