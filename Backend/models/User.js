// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: { 
    type: Number, 
    default: 0 
  },
  // Add these two new fields for password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;