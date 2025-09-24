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
    console.log(`New Trade added to DB`);
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

// GET: รายการที่ Want to Buy เท่านั้น
router.get("/buy", async (req, res) => {
  try {
    const trades = await Trade.find({ type: "buy" }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: รายการที่ Want to Sell เท่านั้น
router.get("/sell", async (req, res) => {
  try {
    const trades = await Trade.find({ type: "sell" }).sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 เริ่มการซื้อขายใหม่ (สร้าง Trade)
router.post("/start", async (req, res) => {
  try {
    const { item, price, quantity, buyer, seller } = req.body;
    const trade = new Trade({ item, price, quantity, buyer, seller });
    await trade.save();
    res.json({ message: "Trade started", trade });
    console.log(`New Trade started`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💬 ส่งข้อความในห้องแชท
router.post("/:tradeId/message", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { sender, text } = req.body;

    const trade = await Trade.findById(tradeId);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    trade.messages.push({ sender, text });
    await trade.save();

    res.json({ message: "Message sent", trade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Confirm การซื้อขาย
router.post("/:tradeId/confirm", async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { username } = req.body;

    const trade = await Trade.findById(tradeId);
    if (!trade) return res.status(404).json({ message: "Trade not found" });

    // ผู้ซื้อกด Confirm
    if (trade.buyer === username) trade.buyerConfirm = true;

    // ผู้ขายกด Confirm
    if (trade.seller === username) trade.sellerConfirm = true;

    // ถ้าทั้งคู่ confirm แล้ว → completed
    if (trade.buyerConfirm && trade.sellerConfirm) {
      trade.status = "completed";
      console.log(`Trade Completed`);
    }

    await trade.save();
    res.json({ message: "Confirmation updated", trade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 ดึงข้อมูล Trade + แชท
router.get("/:tradeId", async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: "Trade not found" });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

console.log(`Trade Routes Status: Ready`);
