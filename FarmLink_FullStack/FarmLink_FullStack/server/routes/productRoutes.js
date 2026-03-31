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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* UPDATE product – farmer or admin only */
router.put("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
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
