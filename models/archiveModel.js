const mongoose = require('mongoose');

const archiveShema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now(),
  },
  temperature: Number,
  humidity: Number,
  pH: Number,
});


module.exports = mongoose.model("Archive", archiveShema);
