const express = require("express");
const router = express.Router();
const tradeController = require("../controllers/tradeController");

// Define a route for creating a new trade item
router.post("/trades", tradeController.createTradeItem);

// item listing
router.get("/trades", async (req, res) => {
    try {
        const Trade = require("../models/Item");
        const trades = await Trade.find().sort({ createdAt: -1 }); // Get latest first
        res.json(trades);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch trades",
            error: error.message
        });
    }
});

module.exports = router;