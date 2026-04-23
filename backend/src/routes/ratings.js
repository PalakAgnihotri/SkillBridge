const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Rating  = require('../models/Rating');
const User    = require('../models/User');

// POST submit a rating after session
router.post('/', auth, async (req, res) => {
  try {
    const { sessionId, rateeId, score, comment } = req.body;

    const already = await Rating.findOne({ session: sessionId, rater: req.userId });
    if (already) return res.status(400).json({ message: 'Already rated this session' });

    const rating = await Rating.create({
      session: sessionId,
      rater:   req.userId,
      ratee:   rateeId,
      score,
      comment: comment || '',
    });

    // Recalculate the ratee's average rating
    const allRatings = await Rating.find({ ratee: rateeId });
    const avg = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    await User.findByIdAndUpdate(rateeId, {
      rating:       Math.round(avg * 10) / 10,
      totalRatings: allRatings.length,
    });

    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET ratings received by a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate('rater', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
