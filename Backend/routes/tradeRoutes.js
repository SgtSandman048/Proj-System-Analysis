const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");

// เพิ่มการซื้อ/ขาย
router.post("/add", async (req, res) => {
  try {
    const { type, game, item, imageUrl, price, quantity } = req.body;
    const trade = new Trade({ type, game, item, imageUrl, price, quantity });
    await trade.save();
    res.json({ message: "Trade created successfully", trade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูลทั้งหมด (สำหรับแสดงในเว็บ)
router.get("/list", async (req, res) => {
  try {
    const trades = await Trade.find();
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
console.log(`TradeRoutes.js Activated`);