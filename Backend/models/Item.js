const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
  type: { type: String, enum: ["buy", "sell"], required: true },
  game: { type: String, required: true },
  item: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trade", TradeSchema);
