// controllers/userController.js
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
// For sending emails, you would use a package like Nodemailer, but we'll simulate the process here.

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update password
exports.updatePassword = async (req, res) => {
  const { email, new_password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set new password
    user.password = new_password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been successfully updated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Request password reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user;
  
  try {
    user = await User.findOne({ email });
    if (!user) {
      // Send a 200 status even if the user isn't found to prevent email enumeration
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real application, you would send an email here.
    // Example: sendEmail(user.email, 'Password Reset', `Please use the following link to reset your password: http://yourdomain.com/resetpassword/${resetToken}`);
    
    res.status(200).json({ message: 'Password reset link sent.', resetToken }); // The token is for testing purposes only
  } catch (error) {
    // Only clear token fields if user exists
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reset password
exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
