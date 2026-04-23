const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

// POST create session request
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, scheduledAt, duration, notes } = req.body;
    const session = await Session.create({
      requester: req.userId,
      receiver:  receiverId,
      skillOffered,
      skillWanted,
      scheduledAt,
      duration: duration || 60,
      notes:    notes || '',
      roomId:   uuidv4(),
    });
    const populated = await session.populate('requester receiver', 'name avatar skillsIKnow skillsIWant');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET my sessions (sent + received)
router.get('/my', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ requester: req.userId }, { receiver: req.userId }]
    })
      .populate('requester receiver', 'name avatar rating skillsIKnow skillsIWant')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PATCH update session status (accept / reject / complete / cancel)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('requester receiver', 'name avatar');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
