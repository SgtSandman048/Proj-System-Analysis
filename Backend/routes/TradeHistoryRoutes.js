// routes/tradeHistoryRoutes.js
const express = require('express');
const router = express.Router();
const TradeHistory = require('../models/TradeHistory');

// Create a new trade history entry
router.post('/create', async (req, res) => {
    try {
        const { 
            userId, 
            username,
            itemName, 
            price, 
            quantity,
            type, // 'buy' or 'sell'
            game, // 'PetSimulator' or 'GrowAGarden'
            status, // 'pending', 'success', 'support'
            imageUrl
        } = req.body;

        // Validate required fields
        if (!itemName || !price || !quantity || !type || !game) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        const newHistory = new TradeHistory({
            userId: userId || 'guest',
            username: username || 'Guest User',
            itemName,
            price,
            quantity,
            type,
            game,
            status: status || 'pending',
            imageUrl: imageUrl || null,
            date: new Date()
        });

        await newHistory.save();

        res.status(201).json({ 
            message: 'Trade history created successfully',
            data: newHistory 
        });

    } catch (error) {
        console.error('Error creating trade history:', error);
        res.status(500).json({ 
            message: 'Error creating trade history', 
            error: error.message 
        });
    }
});

// Get trade history for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const history = await TradeHistory.find({ userId })
            .sort({ date: -1 })
            .limit(50);

        res.status(200).json(history);

    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({ 
            message: 'Error fetching trade history', 
            error: error.message 
        });
    }
});

// Get all trade history (for admin or testing)
router.get('/all', async (req, res) => {
    try {
        const history = await TradeHistory.find()
            .sort({ date: -1 })
            .limit(100);

        res.status(200).json(history);

    } catch (error) {
        console.error('Error fetching all trade history:', error);
        res.status(500).json({ 
            message: 'Error fetching trade history', 
            error: error.message 
        });
    }
});

// Update trade status
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedHistory = await TradeHistory.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedHistory) {
            return res.status(404).json({ message: 'Trade history not found' });
        }

        res.status(200).json({ 
            message: 'Trade history updated successfully',
            data: updatedHistory 
        });

    } catch (error) {
        console.error('Error updating trade history:', error);
        res.status(500).json({ 
            message: 'Error updating trade history', 
            error: error.message 
        });
    }
});

module.exports = router;
console.log('Trade History Routes Status: Ready');