const mongoose = require('mongoose');

const journalShema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  title: {
    type: String,
    required: [true, 'Journal record must have a title.'],
  },
  text: {
    type: String,
  },
  marker: {
    type: String,
    enum: ['regular', 'problem', 'change settings', 'question'],
    default: 'regular',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Journal record must belong to a user.'],
  },
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


journalShema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name role',
  });
  next();
});


module.exports = mongoose.model('JournalRecord', journalShema);
