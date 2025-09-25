// models/Message.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  tradeSession: { type: mongoose.Schema.Types.ObjectId, ref: "TradeSession", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
