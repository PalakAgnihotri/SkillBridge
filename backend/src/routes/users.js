const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');

// GET my profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PUT update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, college, skillsIKnow, skillsIWant, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, college, skillsIKnow, skillsIWant, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// GET any user by ID (public profile)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
