const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { getMatches } = require('../controllers/matchController');

// GET /api/matches — returns sorted, scored matches for logged-in user
router.get('/', auth, getMatches);

module.exports = router;
