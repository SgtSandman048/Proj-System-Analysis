const express = require('express');
const mongoose = require('mongoose');
const History = require('./models/History'); // Adjust the path as needed

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const history = await History.find({ userId: userId }).sort({ date: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
});

module.exports = router;