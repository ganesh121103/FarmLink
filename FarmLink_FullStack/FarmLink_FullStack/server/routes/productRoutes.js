const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const Product = require("../models/Product");

/* GET products – public */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ADD product – farmer or admin only */
router.post("/", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);

    // 🔔 TRIGGER: Notify customers who previously bought in the same category
    setImmediate(async () => {
      try {
        if (!product.category) return;
        // Find orders that contain a product from this category
        const allProducts = await Product.find({ category: product.category }).select("_id");
        const productIds = allProducts.map((p) => p._id);
        const orders = await Order.find({ "items.productId": { $in: productIds } }).select("userId");
        const customerIds = [...new Set(orders.map((o) => o.userId?.toString()).filter(Boolean))];

        const customers = await User.find({ _id: { $in: customerIds } }).select("email fcmToken");

        const notifications = [];
        for (const c of customers) {
            notifications.push({
              userId: c._id,
              title: `New in ${product.category} 🌱`,
              message: `"${product.name}" just arrived — a new product in a category you love!`,
              image: product.image || "",
              link: product._id.toString(),
              type: "Recommendation",
            });
            
            // Dispatch third-party alerts safely
            await sendEmail(
                c.email, 
                `New in ${product.category} 🌱`, 
                `<b>${product.name}</b> just arrived on FarmLink!`
            );
            await sendPushNotification(
                c.fcmToken, 
                `New in ${product.category} 🌱`, 
                `"${product.name}" just arrived in ${product.category}!`,
                { type: "Recommendation", link: product._id.toString() }
            );
        }

        if (notifications.length > 0) await Notification.insertMany(notifications);
      } catch (e) {
        console.error("[Notification Trigger] Recommendation error:", e.message);
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* UPDATE product – farmer or admin only */
router.put("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);

    // 🔔 TRIGGER: Notify customers who wishlisted this product if stock increased
    setImmediate(async () => {
      try {
        const stockIncreased = req.body.stock !== undefined &&
          oldProduct && Number(req.body.stock) > Number(oldProduct.stock || 0);
        if (!stockIncreased) return;

        const wishlisters = await User.find({ wishlist: req.params.id }).select("_id email fcmToken");
        
        const notifications = [];
        for (const c of wishlisters) {
            notifications.push({
              userId: c._id,
              title: `Back in Stock! 🎉`,
              message: `"${product.name}" is back in stock. Grab it before it's gone!`,
              image: product.image || "",
              link: product._id.toString(),
              type: "Wishlist",
            });

            await sendEmail(
                c.email, 
                `FarmLink: Back in Stock! 🎉`, 
                `Your wishlisted item <b>${product.name}</b> is back in stock.`
            );
            await sendPushNotification(
                c.fcmToken, 
                `Back in Stock! 🎉`, 
                `"${product.name}" is back in stock! Grab it before it's gone.`,
                { type: "Wishlist", link: product._id.toString() }
            );
        }

        if (notifications.length > 0) await Notification.insertMany(notifications);
      } catch (e) {
        console.error("[Notification Trigger] Wishlist restock error:", e.message);
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* DELETE product – farmer or admin only */
router.delete("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const User = require("../models/Customer");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/emailService");
const { sendPushNotification } = require("../utils/pushNotificationService");

/* ADD review to a product */
router.post("/:id/reviews", verifyToken, checkRole("customer"), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Fetch the reviewer's full profile to get their name
    const reviewer = await User.findById(req.user.id).select("name");
    if (!reviewer) {
      return res.status(404).json({ message: "User not found." });
    }

    // REAL Verified Purchase Check
    const hasOrdered = await Order.findOne({
      userId: req.user.id,
      "items.productId": req.params.id
    });

    // FIND existing review from this user
    const existingIndex = product.reviews.findIndex(
      (r) => r.user && r.user.toString() === req.user.id.toString()
    );

    if (existingIndex > -1) {
      // UPDATE existing review
      console.log("Updating existing review for User:", req.user.id);
      product.reviews[existingIndex].rating = Number(rating);
      product.reviews[existingIndex].comment = String(comment);
      product.reviews[existingIndex].isVerified = !!hasOrdered;
      product.reviews[existingIndex].date = Date.now();
    } else {
      // ADD new review
      console.log("Adding new review for User:", req.user.id);
      const review = {
        user: req.user.id,
        userName: reviewer.name,
        rating: Number(rating),
        comment: String(comment),
        isVerified: !!hasOrdered,
        date: Date.now(),
      };
      product.reviews.push(review);
    }

    // Recalculate average and total count
    product.reviewsCount = product.reviews.length;
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = totalRating / product.reviews.length;

    // Use markModified if updating a nested array element
    product.markModified('reviews');

    await product.save();
    res.status(existingIndex > -1 ? 200 : 201).json(product);
  } catch (err) {
    console.error("REVIEW ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* DELETE review from a product - admin only */
router.delete("/:id/reviews/:reviewId", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);

    // Recalculate average and total count
    product.reviewsCount = product.reviews.length;
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
      product.rating = totalRating / product.reviews.length;
    } else {
      product.rating = 0;
    }

    product.markModified('reviews');
    await product.save();
    
    res.status(200).json(product);
  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
