var app = require('./app').init();

require('./routes/share')(app);
require('./routes/photos')(app);
require('./routes/import')(app);
require('./routes/index')(app);
require('./sockets/photos')(app);

/* The 404 Route (ALWAYS Keep this as the last route) */
require('./routes/404')(app);

require('./jobs/groupImages')(app);
require('./jobs/calculateInterestingness')(app);
require('./jobs/tagPhotos')(app);

require('./utils/strings');

app.listen(process.env.PORT || 3000);

console.log("Listening on port %d in %s mode", app.address().port, app.settings.env);
