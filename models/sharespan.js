

var mongoose = require('mongoose'),
    User = require('./user')(mongoose).Schema,
    Schema = mongoose.Schema;

var ShareSpanSchema = new mongoose.Schema({
  added : { type: Date, default: Date.now()},
  startDate: {type : Date},
  stopDate: {type : Date},
  members : [Schema.Types.ObjectId]
});

module.exports = mongoose.model('ShareSpan', ShareSpanSchema);