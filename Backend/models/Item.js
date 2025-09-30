const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
  type: { type: String, enum: ["buy", "sell"], required: true },
  game: { type: String, required: true },
  item: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  uploadedImages: [{
    id: Number,
    name: String,
    url: String,
    size: Number,
    uploadedAt: String
  }],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
});

module.exports = mongoose.model("Trade", TradeSchema);