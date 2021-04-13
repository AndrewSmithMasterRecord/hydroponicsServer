const mongoose = require('mongoose');

const archiveShema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now(),
  },
  temperature: {
    type: Number,
    default: 0,
  },
  humidity: {
    type: Number,
    default: 0,
  },
  pH: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Archive', archiveShema);
