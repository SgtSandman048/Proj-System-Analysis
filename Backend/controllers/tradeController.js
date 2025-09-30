const tradeService = require("../service/tradeService");

// Controller function to handle the POST request for creating a new item
const createTradeItem = async (req, res) => {
  try {
    console.log('Received request body size:', JSON.stringify(req.body).length);
    console.log('Upload images count:', req.body.uploadedImages ? req.body.uploadedImages.length : 0);
    
    const userId = req.user?.id || 'guest-id';
    const username = req.user?.username || req.body.createdBy || 'Guest';
    const tradeData = {
      ...req.body,
      owner: userId,
      createdBy: username
    };
    
    const newTradeItem = await tradeService.createTrade(tradeData);
    
    console.log(`Created ${newTradeItem.type} item request id ${newTradeItem._id} by ${username}`);
    console.log(`Added request to ${newTradeItem.game} marketplace`);
    
    res.status(201).json({
      message: "Trade item created successfully",
      data: newTradeItem
    });
  } catch (error) {
    console.error('Error creating trade item:', error);
    res.status(500).json({
      message: "Failed to create trade item",
      error: error.message
    });
  }
};

module.exports = {
  createTradeItem
};