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
  resetPassword
} = require("../controllers/userController");

// GET all users or filter by role – public for now (farmers list on homepage)
router.get("/", getUsers);

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// FIREBASE / GOOGLE AUTH (find-or-create by firebaseUid)
router.post("/firebase-auth", firebaseAuth);

// FORGOT PASSWORD – sends reset token to email
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD – validates token and sets new password
router.post("/reset-password", resetPassword);

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

module.exports = router;

