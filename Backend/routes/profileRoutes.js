const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path as needed
const History = require('./models/History'); // Adjust the path as needed

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findOne({ userId: userId });
        if (!user) {
            // If user doesn't exist, create a dummy profile for the first fetch
            const newUser = new User({
                userId: userId,
                name: 'New User',
                email: `${userId}@example.com`
            });
            await newUser.save();
            return res.status(200).json(newUser);
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
});

router.put('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const { name, email } = req.body;
        if (!userId || !name || !email) {
            return res.status(400).json({ message: 'User ID, name, and email are required' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { name, email },
            { new: true, runValidators: true } // Return the updated doc and run schema validators
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log a history event for the profile update
        const newHistory = new History({
            userId: userId,
            type: 'Profile Updated',
        });
        await newHistory.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile', error: error.message });
    }
});

module.exports = router;
console.log("Profile Routes Status: Ready");