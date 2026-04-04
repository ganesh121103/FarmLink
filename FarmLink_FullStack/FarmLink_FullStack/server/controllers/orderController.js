const Order = require("../models/Order");
const { logOrderToBlockchain } = require("../utils/blockchainLogger");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, total, address, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const order = await Order.create({
      user: userId,
      items,
      total,
      address,
      paymentMethod
    });

    // --- SIMPLE BLOCKCHAIN ADDITION ---
    const txHash = await logOrderToBlockchain(order._id.toString(), order.total);
    if (txHash) {
        order.blockchainTxHash = txHash;
        await order.save();
    }
    // ----------------------------------

    res.status(201).json(order);
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER ORDERS
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
