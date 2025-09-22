const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    // The auth middleware attaches the user's ID to the request object
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};