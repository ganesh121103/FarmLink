const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const { logOrderToBlockchain } = require("../utils/blockchainLogger");

/* GET orders – authenticated users */
router.get("/", verifyToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== "admin") {
      filter = {
        $or: [
          { userId: req.user.id },
          { "items.farmer": req.user.id }
        ]
      };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST order – authenticated users */
router.post("/", verifyToken, async (req, res) => {
  try {
    // Add date field to match frontend expectation
    const orderData = {
      ...req.body,
      userId: req.user.id,
      date: new Date().toLocaleDateString()
    };
    const order = await Order.create(orderData);

    // --- SIMPLE BLOCKCHAIN ADDITION ---
    const txHash = await logOrderToBlockchain(order._id.toString(), order.total);
    if (txHash) {
        order.blockchainTxHash = txHash;
        await order.save();
    }
    // ----------------------------------

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* UPDATE order status – farmer or admin */
router.put("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
