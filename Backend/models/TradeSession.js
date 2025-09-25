// models/TradeSession.js
const mongoose = require("mongoose");

const TradeSessionSchema = new mongoose.Schema({
  item: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },

  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  buyerConfirmed: { type: Boolean, default: false },
  sellerConfirmed: { type: Boolean, default: false },

  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TradeSession", TradeSessionSchema);
