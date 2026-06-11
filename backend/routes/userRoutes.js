const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");

const {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  firebaseAuth,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmailRegistration,
  resendOtp
} = require("../controllers/userController");

const rateLimit = require("express-rate-limit");

// Strict rate limiter for auth routes to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: "Too many login/register attempts from this IP, please try again after 15 minutes"
});

// GET all users or filter by role – public for now (farmers list on homepage)
router.get("/", getUsers);

// REGISTER
router.post("/register", authLimiter, registerUser);

// VERIFY EMAIL REGISTRATION
router.post("/verify-email", authLimiter, verifyEmailRegistration);

// RESEND OTP
router.post("/resend-otp", authLimiter, resendOtp);

// LOGIN
router.post("/login", authLimiter, loginUser);

// FIREBASE / GOOGLE AUTH (find-or-create by firebaseUid)
router.post("/firebase-auth", authLimiter, firebaseAuth);

// FORGOT PASSWORD – sends reset token to email
router.post("/forgot-password", authLimiter, forgotPassword);

// VERIFY RESET TOKEN - checks if OTP is valid
router.post("/verify-otp", authLimiter, verifyResetToken);

// RESET PASSWORD – validates token and sets new password
router.post("/reset-password", authLimiter, resetPassword);

// GET single user by ID (used on refresh to restore profile image from DB)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const role = req.query.role || 'customer';
    const Customer = require('../models/Customer');
    const Farmer   = require('../models/Farmer');
    const Admin    = require('../models/Admin');
    const Model = role === 'farmer' ? Farmer : role === 'admin' ? Admin : Customer;
    const user = await Model.findById(req.params.id).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE user (own profile) – must be logged in
router.put("/:id", verifyToken, updateUser);

/* ── WISHLIST (customers only) ── */

// GET user's wishlist product IDs
router.get("/:id/wishlist", verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("wishlist");
    if (!customer) return res.status(404).json({ message: "User not found" });
    res.json({ wishlist: customer.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT toggle a product in/out of the DB wishlist
router.put("/:id/wishlist/toggle", verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId required" });

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "User not found" });

    const idx = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );
    let action;
    if (idx > -1) {
      customer.wishlist.splice(idx, 1);
      action = "removed";
    } else {
      customer.wishlist.push(productId);
      action = "added";
    }
    await customer.save();
    res.json({ wishlist: customer.wishlist, action });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── FOLLOW FARMER ── */
router.put("/:id/follow/:farmerId", verifyToken, async (req, res) => {
  try {
    const customerId = req.params.id;
    const farmerId = req.params.farmerId;
    
    // Validate IDs
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const Customer = require("../models/Customer");
    const Farmer = require("../models/Farmer");

    const customer = await Customer.findById(customerId);
    const farmer = await Farmer.findById(farmerId);

    if (!customer || !farmer) {
      return res.status(404).json({ message: "Customer or Farmer not found" });
    }

    const followingIdx = customer.following.findIndex(id => id.toString() === farmerId);
    let action;

    if (followingIdx > -1) {
      // Unfollow
      customer.following.splice(followingIdx, 1);
      
      const followerIdx = farmer.followers.findIndex(id => id.toString() === customerId);
      if (followerIdx > -1) {
        farmer.followers.splice(followerIdx, 1);
      }
      action = "unfollowed";
    } else {
      // Follow
      customer.following.push(farmerId);
      farmer.followers.push(customerId);
      action = "followed";
      
      // ✅ Send Notification & Email to Farmer
      const Notification = require("../models/Notification");
      const { sendEmail } = require("../services/emailService");
      
      await Notification.create({
        userId: farmer._id,
        title: "New Follower!",
        message: `${customer.name} started following you.`,
        type: "Social",
      });

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #16a34a;">New Follower on FarmLink! 🌱</h2>
          <p>Hi ${farmer.name},</p>
          <p>Great news! <strong>${customer.name}</strong> just started following your store.</p>
          <p>Keep posting stories and updates to engage with your growing audience.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The FarmLink Team</strong></p>
        </div>
      `;
      // Don't await email to avoid blocking the response
      sendEmail(farmer.email, "You have a new follower! 🎉", emailHtml).catch(console.error);
    }

    await customer.save();
    await farmer.save();

    res.json({ following: customer.following, action });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user's following list (populated)
router.get("/:id/following", verifyToken, async (req, res) => {
  try {
    const Customer = require("../models/Customer");
    const customer = await Customer.findById(req.params.id).populate('following', 'name image location specialization verified followers');
    if (!customer) return res.status(404).json({ message: "User not found" });
    res.json({ following: customer.following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET farmer's followers list (populated)
router.get("/farmer/:id/followers", verifyToken, async (req, res) => {
  try {
    const Farmer = require("../models/Farmer");
    const farmer = await Farmer.findById(req.params.id).populate('followers', 'name email image location');
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });
    res.json({ followers: farmer.followers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

