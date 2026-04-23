const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 6 },
  avatar:        { type: String, default: '' },
  bio:           { type: String, default: '', maxlength: 300 },
  college:       { type: String, default: '' },
  skillsIKnow:   [{ type: String, trim: true }],
  skillsIWant:   [{ type: String, trim: true }],
  rating:        { type: Number, default: 0 },
  totalRatings:  { type: Number, default: 0 },
  sessionsCount: { type: Number, default: 0 },
  isOnline:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
