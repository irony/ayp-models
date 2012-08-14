var should = require("should");
var app = require('../app');

describe("app", function(){

  var id = Math.floor((Math.random()*10000000)+1).toString();

  it("should be possible to create a user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test', id : id};
	var user = null;
    app.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	err.should.be.null();
		savedUser.should.have.property('accounts');
		done();
    });
  });

  it("should be possible to add new email to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cln@iteam.se'], provider : 'test', id : id};
	var user = null;
    app.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	err.should.be.null();
		savedUser.emails.should.have.length(2);
		done();
    });
  });

  it("should be possible to add new account to an existing user ", function(done) {
	var profile = {displayName : 'Christian Landgren', emails : ['cl@iteam.se'], provider : 'test2', id : id};
	var user = null;
    app.findOrCreateAndUpdateUser(user, profile, function(err, savedUser){
    	err.should.be.null();
		savedUser.should.have.property('accounts');
		savedUser.accounts.should.have.length(2);
		done();
    });
  });
  
  after(function(){
    //console.log("after step")
  });

});
