const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
const { sendEmail, buildHtmlEmail } = require("../services/emailService");
const { sendPushNotification } = require("../services/pushNotificationService");
const { logOrderToBlockchain } = require("../utils/blockchainLogger");

// Helper to find a user across collections
const findUserInCollections = async (userId) => {
  let user = await Customer.findById(userId).select("email name fcmToken role");
  if (!user) user = await Farmer.findById(userId).select("email name fcmToken role");
  if (!user) user = await Admin.findById(userId).select("email name fcmToken role");
  return user;
};

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

/* ─────────────────────────────────────────────────────────────
   GET /api/orders/revenue-chart/:farmerId?farmerName=<name>
   Returns last 6 months of monthly revenue for a specific farmer.
   Uses MongoDB aggregation on the items sub-array.
   ───────────────────────────────────────────────────────────── */
router.get("/revenue-chart/:farmerId", verifyToken, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { farmerId } = req.params;
    // farmerName passed as query param (GET requests have no request body)
    const farmerName = req.query.farmerName || "";

    // Safely parse farmerId into an ObjectId
    let farmerObjId = null;
    try {
      farmerObjId = new mongoose.Types.ObjectId(farmerId);
    } catch (_) { /* invalid ObjectId – will rely on name match */ }

    // Build the last 6 calendar months (inclusive of current)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1, // 1-based
        label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      });
    }

    // Build OR conditions for farmer matching:
    //  - items.farmer stored as ObjectId  (normal case)
    //  - items.farmer stored as string    (legacy/edge case)
    //  - items.farmerName string match    (most reliable fallback)
    const farmerMatchConditions = [];
    if (farmerObjId) farmerMatchConditions.push({ "items.farmer": farmerObjId });
    if (farmerId) farmerMatchConditions.push({ "items.farmer": farmerId });
    if (farmerName) farmerMatchConditions.push({ "items.farmerName": farmerName });

    if (farmerMatchConditions.length === 0) {
      return res.status(400).json({ message: "farmerId or farmerName required" });
    }

    // Aggregation pipeline
    const raw = await Order.aggregate([
      // Pre-filter: non-cancelled orders within last 6 months
      {
        $match: {
          status: { $ne: "Cancelled" },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      // Unwind items array so we can match per-farmer item
      { $unwind: "$items" },
      // Keep only this farmer's items
      { $match: { $or: farmerMatchConditions } },
      // Group by year + month
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderIds: { $addToSet: "$_id" },
        },
      },
    ]);

    console.log(`[RevenueChart] farmerId=${farmerId} farmerName=${farmerName} -> raw groups:`, JSON.stringify(raw));

    // Map to month-keyed lookup
    const lookup = {};
    raw.forEach((r) => {
      const key = `${r._id.year}-${r._id.month}`;
      lookup[key] = {
        revenue: Math.round(r.revenue),
        orders: r.orderIds.length,
      };
    });

    // Final 6-month array with zero-fill for months without data
    const chart = months.map((m) => {
      const key = `${m.year}-${m.month}`;
      return {
        month: m.label,
        revenue: lookup[key]?.revenue || 0,
        orders: lookup[key]?.orders || 0,
      };
    });

    res.json(chart);
  } catch (err) {
    console.error("[Revenue Chart] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* GET /api/orders/frequently-bought-together/:productId
   Returns up to 4 product IDs that are frequently bought with the given productId.
   This is an unauthenticated endpoint. */
router.get("/frequently-bought-together/:productId", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { productId } = req.params;
    let productObjId;
    try {
      productObjId = new mongoose.Types.ObjectId(productId);
    } catch (_) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const raw = await Order.aggregate([
      // Match orders containing the target product
      { $match: { "items.productId": productObjId, status: { $ne: "Cancelled" } } },
      // Unwind items
      { $unwind: "$items" },
      // Exclude the target product itself
      { $match: { "items.productId": { $ne: productObjId } } },
      // Group by productId to count frequency
      {
        $group: {
          _id: "$items.productId",
          count: { $sum: 1 }
        }
      },
      // Sort by highest frequency
      { $sort: { count: -1 } },
      // Limit to top 4
      { $limit: 4 }
    ]);

    const relatedIds = raw.map(r => r._id);
    res.json(relatedIds);
  } catch (err) {
    console.error("[Frequently Bought Together] Error:", err.message);
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

    // 🔔 TRIGGER: Notify Customer (Order Placed) and Farmers (New Order Received)
    setImmediate(async () => {
      try {
        const { sendEmail } = require("../services/emailService");
        const { sendPushNotification } = require("../services/pushNotificationService");
        const Notification = require("../models/Notification");

        // 1. Notify Customer
        const customer = await findUserInCollections(req.user.id);
        const orderIdStr = order._id.toString().slice(-6).toUpperCase();
        
        if (customer) {
          // DB Notification
          await Notification.create({
            userId: customer._id,
            title: `Order Placed Successfully! ✅`,
            message: `Your order #${orderIdStr} has been placed. We're processing it now!`,
            image: order.items?.[0]?.image || "",
            type: "Order"
          });

          // Push Notification
          if (customer.fcmToken) {
            await sendPushNotification(
              customer.fcmToken,
              "Order Placed! 🛒",
              `Order #${orderIdStr} confirmed for ₹${order.total}.`
            );
          }

          // Email
          if (customer.email) {
            const orderItemsHtml = order.items.map(item =>
              `<div style="padding:8px 0;border-bottom:1px solid #e8f5e9;">
                <strong>${item.name}</strong> × ${item.quantity}
                <span style="float:right;color:#2d6a4f;font-weight:bold;">₹${(item.price * item.quantity).toFixed(2)}</span>
              </div>`
            ).join('');
            const confirmHtml = buildHtmlEmail(
              `Order Confirmation #${orderIdStr}`,
              `<h2>Thank you for your order! ✅</h2>
               <p>Hi <strong>${customer.name || 'Customer'}</strong>,</p>
               <p>Your order has been placed successfully and we are processing it now.</p>
               <div class="highlight-box">
                 <strong>Order ID:</strong> #${orderIdStr}<br/>
                 <strong>Total:</strong> ₹${order.total}<br/>
                 <strong>Payment:</strong> ${order.paymentMethod || 'COD'}
               </div>
               <h3 style="color:#2d6a4f;margin:20px 0 10px;">🛒 Items Ordered</h3>
               ${orderItemsHtml}
               <p style="margin-top:16px;">We will notify you by email when your order is shipped.</p>`
            );
            await sendEmail(customer.email, `Order Confirmation #${orderIdStr} – FarmLink`, confirmHtml);
          }
        }

        // 2. Notify Farmers (Extract unique farmer IDs)
        const farmerIds = [...new Set(order.items.map(i => i.farmer).filter(Boolean))];
        for (const fId of farmerIds) {
          const farmer = await findUserInCollections(fId);
          if (farmer) {
             // DB Notification
             await Notification.create({
               userId: farmer._id,
               title: `New Order Received! 🛍️`,
               message: `You received a new order from ${order.userName || 'a customer'} (Order #${orderIdStr}). Check your dashboard!`,
               image: order.items.find(i => i.farmer === fId)?.image || "",
               type: "Order"
             });

             // Push Notification
             if (farmer.fcmToken) {
               await sendPushNotification(
                 farmer.fcmToken,
                 "New Order! 💸",
                 `Order #${orderIdStr} received.`
               );
             }

             // Email
             if (farmer.email) {
               const farmerOrderHtml = buildHtmlEmail(
                 `New Order Received! #${orderIdStr}`,
                 `<h2>New Order Received! 🛍️</h2>
                  <p>Hi <strong>${farmer.name || 'Farmer'}</strong>,</p>
                  <p>A customer has placed an order that includes items from your farm.</p>
                  <div class="highlight-box">
                    <strong>Order ID:</strong> #${orderIdStr}<br/>
                    <strong>Customer:</strong> ${order.userName || 'Customer'}<br/>
                    <strong>Items from your farm:</strong> ${order.items.filter(i => i.farmer?.toString() === fId?.toString()).map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </div>
                  <p>Log in to your FarmLink dashboard to view full details and prepare the shipment.</p>`
               );
               await sendEmail(farmer.email, `New Order Received! #${orderIdStr} – FarmLink`, farmerOrderHtml);
             }
          }
        }
      } catch (err) {
        console.error("❌ Failed to process order notification/email triggers:", err.message);
      }
    });

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

        // Find buyer details across all roles for external alerts
        const customer = await findUserInCollections(order.userId);
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
          if (customer.fcmToken) {
            await sendPushNotification(customer.fcmToken, title, message, { type: "Order", link: "" });
          }
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
