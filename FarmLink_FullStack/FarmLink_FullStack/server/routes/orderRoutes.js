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

        // Re-fetch fresh copy so all subdocument item fields are fully loaded
        const fullOrder = await Order.findById(order._id).lean();
        console.log(`[Email] Order items count: ${fullOrder?.items?.length ?? 0}`, JSON.stringify(fullOrder?.items?.map(i => ({ name: i.name, qty: i.quantity, price: i.price }))));

        // Find customer details for external alerts
        const customer = await User.findById(order.userId).select("email name fcmToken");
        if (customer) {
            const orderId = order._id.toString().slice(-6).toUpperCase();
            const statusColor = status === 'Shipped' ? '#2196F3' : '#4CAF50';

            // Build product rows for the email (Using the actual images)
            const itemRows = (fullOrder.items || []).map(item => `
              <tr>
                <td style="padding:10px 8px;border-bottom:1px solid #e8f5e9;vertical-align:middle;">
                  ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;display:block;" />` : `<div style="width:44px;height:44px;border-radius:8px;background:#52b788;color:#fff;font-size:18px;font-weight:bold;display:flex;align-items:center;justify-content:center;text-align:center;line-height:44px;">${(item.name || 'P').charAt(0).toUpperCase()}</div>`}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e8f5e9;vertical-align:middle;">
                  <strong style="color:#1b2a1e;font-size:14px;">${item.name || 'Product'}</strong><br/>
                  <span style="color:#888;font-size:12px;">Farmer: ${item.farmerName || 'FarmLink Farmer'}</span>
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e8f5e9;vertical-align:middle;text-align:center;color:#555;font-size:14px;">
                  x${item.quantity || 1}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e8f5e9;vertical-align:middle;text-align:right;font-weight:bold;color:#2d6a4f;font-size:14px;">
                  &#8377;${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </td>
              </tr>
            `).join('');

            const emailHtml = buildHtmlEmail(title, `
              <h2>${emoji} ${title}</h2>
              <p>Hi <strong>${customer.name || 'there'}</strong>,</p>
              <p>${message}</p>
              <div class="highlight-box">
                <strong>Order ID:</strong> #${orderId}&nbsp;&nbsp;|&nbsp;&nbsp;
                <strong>Status:</strong> <span style="color:${statusColor};font-weight:bold;">${status}</span>
              </div>

              <h3 style="color:#2d6a4f;margin:24px 0 12px;font-size:16px;">🛒 Items Ordered</h3>
              <table style="width:100%;border-collapse:collapse;font-family:'Segoe UI',Arial,sans-serif;">
                <thead>
                  <tr style="background:#f0f7f4;">
                    <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;width:60px;">Photo</th>
                    <th style="padding:10px 8px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;">Product</th>
                    <th style="padding:10px 8px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;">Qty</th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#aaa;">No items found</td></tr>'}
                </tbody>
                <tfoot>
                  <tr style="background:#f0f7f4;">
                    <td colspan="3" style="padding:12px 8px;font-weight:bold;font-size:15px;color:#1b2a1e;text-align:right;">Order Total</td>
                    <td style="padding:12px 8px;font-weight:bold;font-size:16px;color:#2d6a4f;text-align:right;">₹${(fullOrder.total || 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <p style="margin-top:24px;">${status === 'Shipped'
                ? '🚛 Your order is on its way! Please keep an eye out for the delivery.'
                : '🎉 Thank you for shopping with FarmLink. We hope you enjoy your fresh produce!'
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

/* CANCEL order – customer (before dispatch) */
router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure the customer owns this order (or admin)
    if (order.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow cancellation before dispatch
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage." });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
