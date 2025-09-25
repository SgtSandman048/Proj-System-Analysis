const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");
const Message = require("../models/Message");
const User = require("../models/User");

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
    const { buyerId, sellerId, item, price, quantity } = req.body;

    const session = new TradeSession({
      buyer: buyerId,
      seller: sellerId,
      item,
      price,
      quantity
    });
    await session.save();

    res.json({ message: "Trade session started", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💬 ส่งข้อความในห้องแชท
router.post("/chat/:sessionId", async (req, res) => {
  try {
    const { senderId, text } = req.body;
    const message = new Message({
      tradeSession: req.params.sessionId,
      sender: senderId,
      text
    });
    await message.save();
    res.json({ message: "Chat sent", chat: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ดึงข้อความแชท
router.get("/chat/:sessionId", async (req, res) => {
  try {
    const messages = await Message.find({ tradeSession: req.params.sessionId })
      .populate("sender", "username")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ กด Confirm (Buyer หรือ Seller)
router.post("/confirm/:sessionId", async (req, res) => {
  try {
    const { userId } = req.body;
    const session = await TradeSession.findById(req.params.sessionId);

    if (!session) return res.status(404).json({ error: "Session not found" });

    if (String(session.buyer) === userId) {
      session.buyerConfirmed = true;
    } else if (String(session.seller) === userId) {
      session.sellerConfirmed = true;
    }

    // เช็คว่าทั้งคู่ confirm แล้ว
    if (session.buyerConfirmed && session.sellerConfirmed) {
      const buyer = await User.findById(session.buyer);
      const seller = await User.findById(session.seller);
      const totalPrice = session.price * session.quantity;

      if (buyer.balance < totalPrice) {
        return res.status(400).json({ error: "Buyer does not have enough balance" });
      }

      // หักเงิน buyer → โอนให้ seller
      buyer.balance -= totalPrice;
      seller.balance += totalPrice;

      await buyer.save();
      await seller.save();

      session.status = "completed";
    }

    await session.save();
    res.json({ message: "Confirmation updated", session });
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
