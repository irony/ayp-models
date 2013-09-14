var kue = require('kue'),
    jobs = kue.createQueue();

module.exports = {
  start : function(){

    jobs.process('email', 10, function(job, done){
      setTimeout(function(){
        done();
      }, Math.random() * 5000);
    });

    
  }
};