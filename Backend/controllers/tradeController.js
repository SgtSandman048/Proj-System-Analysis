const tradeService = require("../service/tradeService");

// Controller function to handle the POST request for creating a new item
const createTradeItem = async (req, res) => {
  try {
    const tradeData = req.body;
    const newTradeItem = await tradeService.createTrade(tradeData);
    res.status(201).json({
      message: "Trade item created successfully",
      data: newTradeItem
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create trade item",
      error: error.message
    });
  }
};

module.exports = {
  createTradeItem
};