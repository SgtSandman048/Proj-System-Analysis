// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware and contains { id: userId }
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      balance: user.balance || 0,
      stars: user.stars || 0,
      profileImage: user.profileImage || null
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile', 
      error: error.message 
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // In production, send this via email
    res.status(200).json({ 
      message: 'Password reset token generated',
      resetToken: resetToken // Remove this in production
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ 
      message: 'Error processing password reset', 
      error: error.message 
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};

// Update password directly
exports.updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Email, old password, and new password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({ 
      message: 'Error updating password', 
      error: error.message 
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    // req.user is populated by the auth middleware
    const userId = req.user.id;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Account deleted successfully',
      username: deletedUser.username 
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ 
      message: 'Error deleting account', 
      error: error.message 
    });
  }
};