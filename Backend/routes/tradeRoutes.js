const express = require("express");
const router = express.Router();
const tradeController = require("../controllers/tradeController");

// Define a route for creating a new trade item
router.post("/trades", tradeController.createTradeItem);

// item listing
router.get("/trades", async (req, res) => {
    try {
        const Trade = require("../models/Item");
        const { q } = req.query; // Get search query from search bar
        const filter = q
            ? { item: { $regex: q, $options: "i" } } // Search the item
            : {};
        const trades = await Trade.find(filter).sort({ createdAt: -1 }); // Get latest first
        res.json(trades);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch trades",
            error: error.message
        });
    }
});

router.delete('/trades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and delete the trade item
        const deletedTrade = await Trade.findByIdAndDelete(id);
        
        if (!deletedTrade) {
            return res.status(404).json({ 
                message: 'Trade item not found' 
            });
        }
        
        res.status(200).json({ 
            message: 'Trade item deleted successfully',
            data: deletedTrade
        });
        
    } catch (error) {
        console.error('Error deleting trade item:', error);
        res.status(500).json({ 
            message: 'Error deleting trade item',
            error: error.message 
        });
    }
});

module.exports = router;
console.log("Trade Routes Status: Ready");