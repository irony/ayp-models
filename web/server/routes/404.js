var ViewModel = require('./viewModel');

module.exports = function(app){

  app.get('/*', function(req, res){
      res.render('404.ejs', new ViewModel(req.user));
  });

};