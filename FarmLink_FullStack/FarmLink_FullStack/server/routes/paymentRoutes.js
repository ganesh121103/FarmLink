const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const { logOrderToBlockchain } = require("../utils/blockchainLogger");

/* ══════════════════════════════════════════════════════════════════
   Razorpay instance (server-side only — secret never sent to client)
   ══════════════════════════════════════════════════════════════════ */
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ──────────────────────────────────────────────────────────────────
   POST /api/payment/create-order
   Creates a Razorpay order and returns the order id + public key.
   The frontend uses this to open the Razorpay checkout popup.
   ────────────────────────────────────────────────────────────────── */
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR (integer or float)

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount:   amountInPaise,
      currency: "INR",
      receipt:  `rcpt_${String(req.user.id).slice(-6)}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        platform: "FarmLink",
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      key:             process.env.RAZORPAY_KEY_ID, // safe to send – this is the PUBLIC key
    });
  } catch (err) {
    console.error("❌ [Payment] create-order error:", err.message);
    res.status(500).json({ message: "Failed to create payment order. Please try again." });
  }
});

let lastPaymentError = null;

router.get("/last-error", (req, res) => {
  res.json({ lastPaymentError });
});

/* ──────────────────────────────────────────────────────────────────
   POST /api/payment/verify
   Verifies the HMAC-SHA256 signature from Razorpay.
   On success, creates the final Order document in MongoDB.
   ────────────────────────────────────────────────────────────────── */
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      // Order details
      items,
      address,
      paymentMethod,
      total,
      userName,
    } = req.body;

    // ── 1. Validate required fields ──────────────────────────────────
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // ── 2. Prevent duplicate payments (idempotency) ──────────────────
    const existing = await Order.findOne({ razorpayOrderId });
    if (existing && existing.paymentStatus === "paid") {
      return res.status(409).json({ message: "Payment already processed for this order" });
    }

    // ── 3. HMAC-SHA256 Signature Verification ───────────────────────
    //    Razorpay specification: sign razorpayOrderId + "|" + razorpayPaymentId
    const generated = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generated !== razorpaySignature) {
      console.warn(
        `⚠️ [Payment] Signature mismatch for order ${razorpayOrderId} — possible tampering`
      );
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    // ── 4. Create Order in MongoDB ───────────────────────────────────
    const mongoose = require("mongoose");
    const safeObjectId = (val) => {
      if (!val) return new mongoose.Types.ObjectId().toHexString();
      const str = String(val);
      if (mongoose.Types.ObjectId.isValid(str) && str.length === 24) return str;
      return Buffer.from(str).toString('hex').padStart(24, '0').slice(-24);
    };

    const safeItems = (items || []).map(item => ({
      productId: safeObjectId(item.productId),
      name: item.name || "Unknown Product",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      farmer: safeObjectId(typeof item.farmer === "object" ? (item.farmer._id || "") : item.farmer),
      farmerName: item.farmerName || "Farmer",
      image: item.image || ""
    }));

    const orderData = {
      userId:             req.user.id,
      userName:           userName || "Customer",
      address,
      items:              safeItems,
      total:              Number(total),
      paymentMethod:      paymentMethod || "upi",
      status:             "Placed",
      paymentStatus:      "paid",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      date:               new Date().toLocaleDateString(),
    };

    const order = await Order.create(orderData);

    // ── 5. Optional: Blockchain logging (non-blocking) ───────────────
    try {
      const txHash = await logOrderToBlockchain(order._id.toString(), order.total);
      if (txHash) { order.blockchainTxHash = txHash; await order.save(); }
    } catch (_) { /* blockchain failure should not block payment */ }

    console.log(`✅ [Payment] Verified & order created: ${order._id} | ₹${order.total}`);
    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("❌ [Payment] verify error:", err);
    lastPaymentError = err.message + "\n" + err.stack;
    res.status(500).json({ message: "Order creation failed after payment. Contact support.", errorDetails: err.message, stack: err.stack });
  }
});

/* ──────────────────────────────────────────────────────────────────
   POST /api/payment/refund
   Admin-triggered refund via Razorpay API.
   Body: { orderId, amount? }  (amount in INR, optional — full refund if omitted)
   ────────────────────────────────────────────────────────────────── */
router.post("/refund", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.razorpayPaymentId) return res.status(400).json({ message: "No Razorpay payment ID on this order" });
    if (order.paymentStatus === "refunded") return res.status(400).json({ message: "Already refunded" });

    const refundOptions = {};
    if (amount) refundOptions.amount = Math.round(Number(amount) * 100); // partial refund in paise

    const refund = await razorpay.payments.refund(order.razorpayPaymentId, refundOptions);

    order.paymentStatus = "refunded";
    order.refundId      = refund.id;
    order.refundedAt    = new Date();
    await order.save();

    console.log(`💸 [Refund] ${refund.id} issued for order ${orderId}`);
    res.json({ success: true, refundId: refund.id, refund });
  } catch (err) {
    console.error("❌ [Payment] refund error:", err.message);
    res.status(500).json({ message: err.message || "Refund failed" });
  }
});

/* ──────────────────────────────────────────────────────────────────
   GET /api/payment/transactions
   Admin: Fetch all orders with payment info + summary stats
   ────────────────────────────────────────────────────────────────── */
router.get("/transactions", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const { status } = req.query; // optional filter: paid | pending | failed | refunded

    const filter = {};
    if (status) filter.paymentStatus = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .select("userName total paymentMethod paymentStatus razorpayOrderId razorpayPaymentId refundId createdAt status items");

    // Compute summary
    const paid     = orders.filter(o => o.paymentStatus === "paid");
    const revenue  = paid.reduce((sum, o) => sum + (o.total || 0), 0);
    const pending  = orders.filter(o => o.paymentStatus === "pending").length;
    const failed   = orders.filter(o => o.paymentStatus === "failed").length;
    const refunded = orders.filter(o => o.paymentStatus === "refunded").length;
    const cod      = orders.filter(o => o.paymentStatus === "cod").length;

    res.json({
      orders,
      summary: {
        totalOrders:   orders.length,
        paidOrders:    paid.length,
        totalRevenue:  revenue,
        pendingOrders: pending,
        failedOrders:  failed,
        refundedOrders: refunded,
        codOrders:     cod,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
