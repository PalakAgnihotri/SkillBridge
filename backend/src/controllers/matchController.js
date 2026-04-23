const User = require('../models/User');

// Matching algorithm:
// Score = how much I can teach them + how much they can teach me
// Expressed as a percentage of total skill gaps on both sides
const calcMatchScore = (me, other) => {
  const iTeachThem  = me.skillsIKnow.filter(s => other.skillsIWant.map(x => x.toLowerCase()).includes(s.toLowerCase())).length;
  const theyTeachMe = other.skillsIKnow.filter(s => me.skillsIWant.map(x => x.toLowerCase()).includes(s.toLowerCase())).length;
  const total = me.skillsIWant.length + other.skillsIWant.length;
  if (total === 0) return 0;
  return Math.round(((iTeachThem + theyTeachMe) / total) * 100);
};

exports.getMatches = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    if (!me) return res.status(404).json({ message: 'User not found' });

    if (me.skillsIKnow.length === 0 && me.skillsIWant.length === 0)
      return res.json([]);

    const others = await User.find({ _id: { $ne: req.userId } }).select('-password');

    const matches = others
      .map(other => ({
        ...other.toObject(),
        matchScore: calcMatchScore(me, other),
        canTeachMe: other.skillsIKnow.filter(s =>
          me.skillsIWant.map(x => x.toLowerCase()).includes(s.toLowerCase())
        ),
        iCanTeach: me.skillsIKnow.filter(s =>
          other.skillsIWant.map(x => x.toLowerCase()).includes(s.toLowerCase())
        ),
      }))
      .filter(m => m.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
