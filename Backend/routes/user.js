// routes/user.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private (requires a token)
router.get('/profile', auth, userController.getProfile);

// @route   POST /api/user/forgotpassword
// @desc    Request a password reset link
// @access  Public
router.post('/forgotpassword', userController.forgotPassword);

// @route   PUT /api/user/resetpassword/:token
// @desc    Reset password using a token
// @access  Public
router.put('/resetpassword/:token', userController.resetPassword);

// @route   POST /api/user/updatepassword
// @desc    Update password directly
// @access  Public
router.post('/updatepassword', userController.updatePassword);

// @route   DELETE /api/user/delete
// @desc    Delete user account
// @access  Private (requires a token)
router.delete('/delete', auth, userController.deleteAccount);

module.exports = router;
console.log(`Users Routes Status: Ready`);