var app = require('./app').init(process.env.PORT || 3000);

require('./routes/share')(app);
require('./routes/photos')(app);
require('./routes/import')(app);
require('./routes/index')(app);

/* The 404 Route (ALWAYS Keep this as the last route) */
require('./routes/404')(app);
