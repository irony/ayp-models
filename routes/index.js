var ViewModel = require('./viewModel');

module.exports = function(app){
  app.get('/', function(req,res){

      var model = new ViewModel(req.user);
      res.render('template.ejs', model);
  });

};