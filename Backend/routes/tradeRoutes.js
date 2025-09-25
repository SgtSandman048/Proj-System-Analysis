const express = require("express");
const router = express.Router();
const tradeController = require("../controllers/tradeController");

// Define a route for creating a new trade item
router.post("/trades", tradeController.createTradeItem);

module.exports = router;