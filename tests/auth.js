// run tests locally or with test collection
var nconf = require('nconf');


nconf.overrides({
  mongoUrl : 'mongodb://192.168.59.103/ayp-test'
});

nconf
  .env() // both use environment and file
  .file({file: 'config.json', dir:'../../', search: true});

var Models = require('../').init(nconf);
var auth = Models.auth;
var should = require('should');

describe("auth", function(){

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


    it("should be possible to login as a separate user", function(done) {
      var profile = {displayName : 'Test com', emails : [email.replace('.nu', '.com')], provider : 'test', id : id+1};
      
      auth.findOrCreateAndUpdateUser(null, profile, function(err, savedUser){
        should.ok(!err);
        savedUser.emails.should.have.length(1);
        savedUser._id.should.not.eql(id);
        done();
      });
    });

    it("should not be possible to login with empty email", function(done) {

      var profile1 = {displayName : 'Test com', emails : [null], provider : 'test', id : id+2};
      
      auth.findOrCreateAndUpdateUser(null, profile1, function(err, savedUser){
        should.ok(!err);
        savedUser.emails.should.have.length(0);
        

        var profile2 = {displayName : 'Test com', emails : [null,null], provider : 'test', id : id+3};
        
        auth.findOrCreateAndUpdateUser(null, profile2, function(err, savedUser){
          should.ok(!err);
          savedUser.emails.should.have.length(0);
          savedUser._id.should.not.eql(id+2);
          done();
        });

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
      var profile = {displayName : 'Test Landgren', emails : [], provider : 'test3', id : id+4};
        auth.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
          should.ok(!err);
          savedUser.should.have.property('accounts');
          savedUser.accounts.should.have.property('test');
          savedUser.accounts.should.have.property('test3');
          done();
        });
    });
  });