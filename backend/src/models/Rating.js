const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  rater:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratee:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:   { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 200 },
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
