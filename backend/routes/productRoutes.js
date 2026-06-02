const express = require("express");
const router = express.Router();
const { verifyToken, checkRole, isAdmin } = require("../middleware/authMiddleware");
const Product = require("../models/Product");

/* ── Lazy-loaded dependencies ────────────────────────────────── */
const getModels = () => {
  const User         = require("../models/Customer");
  const Farmer       = require("../models/Farmer");
  const Order        = require("../models/Order");
  const Notification = require("../models/Notification");
  const { sendEmail, buildHtmlEmail }  = require("../services/emailService");
  const { sendPushNotification }       = require("../services/pushNotificationService");
  return { User, Farmer, Order, Notification, sendEmail, buildHtmlEmail, sendPushNotification };
};

/* ── Helper: compute expiresAt from freshnessDays ─────────────── */
const computeExpiresAt = (freshnessDays) => {
  const days = Number(freshnessDays) || 4; // default 4 days
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 999); // end of that day
  return d;
};

/* ════════════════════════════════════════════════════════════════
   GET products – public
   ════════════════════════════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().select("-images -reviews.images");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════
   GET product by ID – public
   ════════════════════════════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════
   ADD product – farmer or admin only
   Sets expiresAt automatically from freshnessDays (default 4)
   Email triggers:
     🌱 NewArrival  → customers who bought in same category
     🧑‍🌾 NewArrival  → farmers cross-referenced by email
   ════════════════════════════════════════════════════════════════ */
const crypto = require('crypto');
const mongoose = require('mongoose');

router.post("/", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    // Auto-compute expiresAt if not provided
    const freshnessDays = Number(req.body.freshnessDays) || 4;
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : computeExpiresAt(freshnessDays);

    // Immutable Ledger Hash Generation
    const _id = new mongoose.Types.ObjectId();
    req.body._id = _id;
    
    const dataString = JSON.stringify({
        id: _id.toString(),
        name: req.body.name,
        farmer: req.body.farmerName,
        price: req.body.price,
        type: req.body.farmingType || 'Standard Farming',
        timestamp: new Date().toISOString()
    });
    
    const txHash = '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
    req.body.txHash = txHash;

    const product = await Product.create({ ...req.body, freshnessDays, expiresAt });
    res.json(product);

    setImmediate(async () => {
      try {
        if (!product.category) return;
        const { User, Farmer, Order, Notification, sendEmail, buildHtmlEmail, sendPushNotification } = getModels();

        // 1. Find products in same category → get orders → get buyer IDs
        const catProducts = await Product.find({ category: product.category }).select("_id");
        const productIds  = catProducts.map((p) => p._id);
        const orders      = await Order.find({ "items.productId": { $in: productIds } }).select("userId");
        let customerIds = orders.map((o) => o.userId?.toString()).filter(Boolean);

        // 1b. Get the followers of the farmer who added this product
        const farmerObj = await Farmer.findById(product.farmer).select("followers");
        if (farmerObj && farmerObj.followers) {
            customerIds = [...customerIds, ...farmerObj.followers.map(id => id.toString())];
        }

        customerIds = [...new Set(customerIds)];
        if (customerIds.length === 0) return;

        // 2. Fetch customers
        const customers = await User.find({ _id: { $in: customerIds } }).select("_id name email fcmToken");

        // ── In-app notifications for customers ───────────────────
        const customerNotifs = customers.map((c) => ({
          userId:  c._id,
          title:   `New Arrival: ${product.name} 🌱`,
          message: `Fresh ${product.category} is here! "${product.name}" by ${product.farmerName || "a farmer"} just landed on FarmLink.`,
          image:   product.image || "",
          link:    product._id.toString(),
          type:    "NewArrival",
        }));
        if (customerNotifs.length > 0) await Notification.insertMany(customerNotifs);

        // ── Branded email + push to each customer ────────────────
        const freshUntil = expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
        for (const c of customers) {
          const subject   = `🌱 New in ${product.category} — FarmLink`;
          const emailHtml = buildHtmlEmail(subject, `
            <h2>🌿 Fresh Arrival Just for You!</h2>
            <p>Hi <strong>${c.name || "there"}</strong>,</p>
            <p>A brand-new product has just arrived in a category you love — <strong>${product.category}</strong>!</p>
            <div class="highlight-box">
              <strong>Product:</strong> ${product.name}<br/>
              <strong>Seller:</strong> ${product.farmerName || "FarmLink Farmer"}<br/>
              <strong>Category:</strong> ${product.category}<br/>
              <strong>Price:</strong> ₹${product.price}<br/>
              <strong>Fresh Until:</strong> ${freshUntil} (${freshnessDays} days)
            </div>
            <p>Don't miss out — fresh produce sells out fast. Head to FarmLink and grab yours today!</p>
            <p style="color:#888;font-size:13px;">This is an automated notification. Please do not reply to this email.</p>
          `);
          await sendEmail(c.email, subject, emailHtml);
          await sendPushNotification(
            c.fcmToken,
            `New Arrival: ${product.name} 🌱`,
            `Fresh ${product.category} just landed on FarmLink!`,
            { type: "NewArrival", link: product._id.toString() }
          );
        }

        // ── Farmers who also bought in this category (email cross-ref) ──
        const customerEmails   = customers.map((c) => c.email?.toLowerCase()).filter(Boolean);
        if (customerEmails.length === 0) return;

        const matchingFarmers = await Farmer.find({ email: { $in: customerEmails } })
                                            .select("_id name email fcmToken");

        const farmerNotifs = matchingFarmers.map((f) => ({
          userId:  f._id,
          title:   `New Stock You Might Like 🧑‍🌾`,
          message: `"${product.name}" — a new ${product.category} product from ${product.farmerName || "a fellow farmer"} is now available.`,
          image:   product.image || "",
          link:    product._id.toString(),
          type:    "NewArrival",
        }));
        if (farmerNotifs.length > 0) await Notification.insertMany(farmerNotifs);

        for (const f of matchingFarmers) {
          const subject   = `🌾 New Stock: ${product.name} — FarmLink`;
          const emailHtml = buildHtmlEmail(subject, `
            <h2>🧑‍🌾 New Stock Alert!</h2>
            <p>Hi <strong>${f.name || "there"}</strong>,</p>
            <p>A product matching your buying history just arrived on FarmLink:</p>
            <div class="highlight-box">
              <strong>Product:</strong> ${product.name}<br/>
              <strong>Seller:</strong> ${product.farmerName || "FarmLink Farmer"}<br/>
              <strong>Category:</strong> ${product.category}<br/>
              <strong>Price:</strong> ₹${product.price}<br/>
              <strong>Fresh Until:</strong> ${freshUntil}
            </div>
            <p>Check it out on FarmLink before it sells out!</p>
            <p style="color:#888;font-size:13px;">This is an automated notification. Please do not reply to this email.</p>
          `);
          await sendEmail(f.email, subject, emailHtml);
          await sendPushNotification(
            f.fcmToken,
            `New Stock: ${product.name} 🌾`,
            `A new ${product.category} product you might like just arrived!`,
            { type: "NewArrival", link: product._id.toString() }
          );
        }
      } catch (e) {
        console.error("[Notification Trigger] NewArrival error:", e.message);
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════
   UPDATE product – farmer or admin only
   Email triggers:
     🎉 Back in Stock  → wishlisters (stock was 0, now > 0)
     📦 Out of Stock   → wishlisters (stock just became 0)
     💸 Price Drop     → wishlisters (price decreased)
   ════════════════════════════════════════════════════════════════ */
router.put("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    const product    = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);

    setImmediate(async () => {
      try {
        if (!oldProduct || !product) return;
        const { User, Notification, sendEmail, buildHtmlEmail, sendPushNotification } = getModels();

        const newStock = Number(req.body.stock ?? oldProduct.stock);
        const oldStock = Number(oldProduct.stock || 0);
        const newPrice = Number(req.body.price  ?? oldProduct.price);
        const oldPrice = Number(oldProduct.price || 0);

        // Fetch wishlisters
        const wishlistersIds = await User.find({ wishlist: req.params.id }).distinct("_id");
        let targetUserIds = [...wishlistersIds.map(id => id.toString())];

        // Fetch followers
        const { Farmer } = getModels();
        const farmerObj = await Farmer.findById(product.farmer).select("followers");
        if (farmerObj && farmerObj.followers) {
            targetUserIds = [...targetUserIds, ...farmerObj.followers.map(id => id.toString())];
        }
        
        targetUserIds = [...new Set(targetUserIds)];

        const targetUsers = await User.find({ _id: { $in: targetUserIds } })
                                      .select("_id name email fcmToken");

        /* ── 🎉 Back in Stock ────────────────────────────────── */
        if (req.body.stock !== undefined && newStock > 0 && oldStock === 0) {
          const title   = `Back in Stock! 🎉`;
          const message = `"${product.name}" is back in stock. Grab it before it's gone!`;

          const notifs = targetUsers.map((c) => ({
            userId: c._id, title, message,
            image:  product.image || "",
            link:   product._id.toString(),
            type:   "Wishlist",
          }));
          if (notifs.length > 0) await Notification.insertMany(notifs);

          for (const c of targetUsers) {
            const subject   = `🎉 Back in Stock — ${product.name} | FarmLink`;
            const emailHtml = buildHtmlEmail(subject, `
              <h2>🎉 Great News!</h2>
              <p>Hi <strong>${c.name || "there"}</strong>,</p>
              <p>Your wishlisted item is back on FarmLink!</p>
              <div class="highlight-box">
                <strong>Product:</strong> ${product.name}<br/>
                <strong>Seller:</strong> ${product.farmerName || "FarmLink Farmer"}<br/>
                <strong>Price:</strong> ₹${product.price}<br/>
                <strong>In Stock:</strong> ${newStock} unit${newStock > 1 ? "s" : ""} available
              </div>
              <p>Hurry — stock is limited and sells out fast!</p>
              <p style="color:#888;font-size:13px;">You are receiving this because you wishlisted this product on FarmLink.</p>
            `);
            await sendEmail(c.email, subject, emailHtml);
            await sendPushNotification(
              c.fcmToken, title,
              `"${product.name}" is back. Grab it before it's gone!`,
              { type: "Wishlist", link: product._id.toString() }
            );
          }
        }

        /* ── 📦 Out of Stock ─────────────────────────────────── */
        if (req.body.stock !== undefined && newStock === 0 && oldStock > 0) {
          const title   = `Out of Stock 😔`;
          const message = `"${product.name}" just went out of stock.`;

          const notifs = targetUsers.map((c) => ({
            userId: c._id, title, message,
            image:  product.image || "",
            link:   product._id.toString(),
            type:   "OutOfStock",
          }));
          if (notifs.length > 0) await Notification.insertMany(notifs);

          for (const c of targetUsers) {
            const subject   = `😔 Out of Stock — ${product.name} | FarmLink`;
            const emailHtml = buildHtmlEmail(subject, `
              <h2>😔 Item Out of Stock</h2>
              <p>Hi <strong>${c.name || "there"}</strong>,</p>
              <p>We wanted to let you know that your wishlisted item just went out of stock:</p>
              <div class="highlight-box">
                <strong>Product:</strong> ${product.name}<br/>
                <strong>Seller:</strong> ${product.farmerName || "FarmLink Farmer"}<br/>
                <strong>Category:</strong> ${product.category || "—"}
              </div>
              <p>Don't worry! The item is still saved in your wishlist and we will <strong>automatically notify you</strong> the moment it's back in stock.</p>
              <p style="color:#888;font-size:13px;">You are receiving this because you wishlisted this product on FarmLink.</p>
            `);
            await sendEmail(c.email, subject, emailHtml);
            await sendPushNotification(
              c.fcmToken, title,
              `"${product.name}" you wishlisted went out of stock.`,
              { type: "OutOfStock", link: product._id.toString() }
            );
          }
        }

        /* ── 💸 Price Drop ───────────────────────────────────── */
        if (req.body.price !== undefined && newPrice < oldPrice && oldPrice > 0) {
          const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
          const savings  = (oldPrice - newPrice).toFixed(2);
          const title    = `Price Drop! 💸 ${discount}% Off`;
          const message  = `"${product.name}" price dropped from ₹${oldPrice} to ₹${newPrice}. Don't miss this deal!`;

          const notifs = targetUsers.map((c) => ({
            userId: c._id, title, message,
            image:  product.image || "",
            link:   product._id.toString(),
            type:   "PriceDrop",
          }));
          if (notifs.length > 0) await Notification.insertMany(notifs);

          for (const c of targetUsers) {
            const subject   = `💸 Price Drop: Save ${discount}% on ${product.name} | FarmLink`;
            const emailHtml = buildHtmlEmail(subject, `
              <h2>💸 Price Drop Alert!</h2>
              <p>Hi <strong>${c.name || "there"}</strong>,</p>
              <p>A product on your wishlist just got cheaper — grab it now before the price goes back up!</p>
              <div class="highlight-box">
                <strong>Product:</strong> ${product.name}<br/>
                <strong>Seller:</strong> ${product.farmerName || "FarmLink Farmer"}<br/>
                <strong>Old Price:</strong> <span style="text-decoration:line-through;color:#999;">₹${oldPrice}</span><br/>
                <strong>New Price:</strong> <span style="color:#2d6a4f;font-weight:bold;font-size:18px;">₹${newPrice}</span><br/>
                <strong>You Save:</strong> <span style="color:#e63946;font-weight:bold;">₹${savings} (${discount}% off) 🎉</span>
              </div>
              <p>This deal won't last forever — act fast!</p>
              <p style="color:#888;font-size:13px;">You are receiving this because you wishlisted this product on FarmLink.</p>
            `);
            await sendEmail(c.email, subject, emailHtml);
            await sendPushNotification(
              c.fcmToken, title,
              `"${product.name}" is now ₹${newPrice} (was ₹${oldPrice})!`,
              { type: "PriceDrop", link: product._id.toString() }
            );
          }
        }
      } catch (e) {
        console.error("[Notification Trigger] Product update error:", e.message);
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════
   DELETE product – farmer or admin only
   Notification triggers (when admin deletes a farmer's product):
     🗑️ ProductRemoved → farmer (in-app notification + email)
   ════════════════════════════════════════════════════════════════ */
router.delete("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    // Fetch product BEFORE deleting so we have all the info we need
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Capture who is deleting (for the notification message)
    const deletedByAdmin = req.user.role === "admin";
    const farmerId       = product.farmer;     // ObjectId of the farmer who owns it

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });

    // ── Fire notifications asynchronously — don't block the response ──
    if (deletedByAdmin && farmerId) {
      setImmediate(async () => {
        try {
          const { Farmer, Notification, sendEmail, buildHtmlEmail, sendPushNotification } = getModels();

          const farmer = await Farmer.findById(farmerId).select("_id name email fcmToken");
          if (!farmer) return;

          const title   = `⚠️ Product Removed by Admin`;
          const message = `Your product "${product.name}" (${product.category}, ₹${product.price}/kg) has been removed from FarmLink by an administrator. If you believe this was a mistake, please contact support.`;

          // ── In-app notification ───────────────────────────────────
          await Notification.create({
            userId:  farmer._id,
            title,
            message,
            image:   product.image || "",
            link:    "",          // product is gone, no point linking to it
            type:    "Admin",
          });

          // ── Email ─────────────────────────────────────────────────
          const subject   = `⚠️ Your Product Was Removed — FarmLink`;
          const emailHtml = buildHtmlEmail(subject, `
            <h2>⚠️ Product Removed</h2>
            <p>Hi <strong>${farmer.name || "there"}</strong>,</p>
            <p>We're writing to inform you that one of your listed products has been <strong>removed from the FarmLink platform</strong> by an administrator.</p>
            <div class="highlight-box" style="border-left-color:#e63946;background:#fff5f5;">
              <strong>Product Name:</strong> ${product.name}<br/>
              <strong>Category:</strong> ${product.category}<br/>
              <strong>Price:</strong> ₹${product.price}/kg<br/>
              <strong>Stock:</strong> ${product.stock} kg<br/>
              <strong>Removed On:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <p>This action may have been taken due to a policy violation, expired listing, or quality concern. If you believe this was done in error, please reach out to our support team.</p>
            <p>You can re-list your product from your Farmer Dashboard after reviewing our listing guidelines.</p>
            <p style="color:#888;font-size:13px;">This is an automated notification from FarmLink. Please do not reply to this email.</p>
          `);
          await sendEmail(farmer.email, subject, emailHtml);

          // ── Push notification (if FCM token exists) ───────────────
          await sendPushNotification(
            farmer.fcmToken,
            title,
            `Your product "${product.name}" was removed by an admin. Tap for details.`,
            { type: "Admin" }
          );

          console.log(`[ProductRemoved] Notified farmer ${farmer.email} about removal of "${product.name}"`);
        } catch (e) {
          console.error("[Notification Trigger] ProductRemoved error:", e.message);
        }
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════
   ADD review to a product – customers only
   ════════════════════════════════════════════════════════════════ */
router.post("/:id/reviews", verifyToken, checkRole("customer"), async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const { User, Order } = getModels();
    const reviewer = await User.findById(req.user.id).select("name");
    if (!reviewer) return res.status(404).json({ message: "User not found." });

    const hasOrdered = await Order.findOne({
      userId: req.user.id,
      "items.productId": req.params.id,
    });

    const existingIndex = product.reviews.findIndex(
      (r) => r.user && r.user.toString() === req.user.id.toString()
    );

    if (existingIndex > -1) {
      product.reviews[existingIndex].rating     = Number(rating);
      product.reviews[existingIndex].comment    = String(comment);
      if (images !== undefined) product.reviews[existingIndex].images = images;
      product.reviews[existingIndex].isVerified = !!hasOrdered;
      product.reviews[existingIndex].date       = Date.now();
    } else {
      product.reviews.push({
        user:       req.user.id,
        userName:   reviewer.name,
        rating:     Number(rating),
        comment:    String(comment),
        images:     images || [],
        isVerified: !!hasOrdered,
        date:       Date.now(),
      });
    }

    product.reviewsCount = product.reviews.length;
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating    = totalRating / product.reviews.length;
    product.markModified("reviews");

    await product.save();
    res.status(existingIndex > -1 ? 200 : 201).json(product);
  } catch (err) {
    console.error("REVIEW ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════
   DELETE review – admin only
   ════════════════════════════════════════════════════════════════ */
router.delete("/:id/reviews/:reviewId", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId
    );
    if (reviewIndex === -1) return res.status(404).json({ message: "Review not found." });

    product.reviews.splice(reviewIndex, 1);
    product.reviewsCount = product.reviews.length;
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.rating    = totalRating / product.reviews.length;
    } else {
      product.rating = 0;
    }

    product.markModified("reviews");
    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
