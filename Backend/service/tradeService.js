const Trade = require("../models/Item");

// Function to create a new trade item
const createTrade = async (tradeData) => {
  try {
    const newTrade = new Trade(tradeData);
    await newTrade.save();
    return newTrade;
  } catch (error) {
    throw new Error("Error creating trade: " + error.message);
  }
};

module.exports = {
  createTrade
};