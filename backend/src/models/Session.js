const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  requester:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillOffered: { type: String, required: true },
  skillWanted:  { type: String, required: true },
  scheduledAt:  { type: Date },
  duration:     { type: Number, default: 60 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  roomId: { type: String },
  notes:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
