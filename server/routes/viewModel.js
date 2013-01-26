

var locals = {
    title: 'All Your Photos',
    description: 'One place to rule them all',
    author: 'Christian Landgren'
};

module.exports = function(user){
  // clone default values and create a new model
  var model = JSON.parse(JSON.stringify(locals));
  model.user = user;
  model.title = user ? user.displayName + "'s photos" : locals.title;
  return model;
};