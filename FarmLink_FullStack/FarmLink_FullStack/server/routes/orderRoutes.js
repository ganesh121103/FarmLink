const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/Customer");
const { sendEmail, buildHtmlEmail } = require("../utils/emailService");
const { sendPushNotification } = require("../utils/pushNotificationService");
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

    // 🔔 TRIGGER: Notify customer when order is Shipped or Delivered
    setImmediate(async () => {
      try {
        const { status } = req.body;
        if (!order || !['Shipped', 'Delivered'].includes(status)) return;

        const emoji = status === 'Shipped' ? '🚚' : '🎉';
        const title = status === 'Shipped' ? `Your Order is On Its Way! ${emoji}` : `Order Delivered! ${emoji}`;
        const message = status === 'Shipped'
          ? `Your order #${order._id.toString().slice(-6).toUpperCase()} has been shipped and is on its way to you.`
          : `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered. Enjoy!`;

        await Notification.create({
          userId: order.userId,
          title,
          message,
          image: order.items?.[0]?.image || "",
          link: "",
          type: "Order",
        });

        // Find customer details for external alerts
        const customer = await User.findById(order.userId).select("email name fcmToken");
        if (customer) {
            const orderId = order._id.toString().slice(-6).toUpperCase();
            const statusColor = status === 'Shipped' ? '#2196F3' : '#4CAF50';

            const emailHtml = buildHtmlEmail(title, `
              <h2>${emoji} ${title}</h2>
              <p>Hi <strong>${customer.name || 'there'}</strong>,</p>
              <p>${message}</p>
              <div class="highlight-box">
                <strong>Order ID:</strong> #${orderId}<br/>
                <strong>Status:</strong> <span style="color:${statusColor};font-weight:bold;">${status}</span>
              </div>
              <p>${status === 'Shipped'
                ? 'Your order is on its way! Please keep an eye out for the delivery.'
                : 'Thank you for shopping with FarmLink. We hope you enjoy your fresh produce!'
              }</p>
              <p style="color:#888;font-size:13px;">This is an automated notification. Please do not reply to this email.</p>
            `);

            await sendEmail(customer.email, title, emailHtml);
            await sendPushNotification(customer.fcmToken, title, message, { type: "Order", link: "" });
        }
      } catch (e) {
        console.error("[Notification Trigger] Order status error:", e.message);
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
