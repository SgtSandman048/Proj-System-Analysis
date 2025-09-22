const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private (requires a token)
router.get('/profile', auth, userController.getProfile);

module.exports = router;