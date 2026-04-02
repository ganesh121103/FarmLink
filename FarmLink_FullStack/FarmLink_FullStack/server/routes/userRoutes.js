const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  firebaseAuth
} = require("../controllers/userController");

// GET all users or filter by role – public for now (farmers list on homepage)
router.get("/", getUsers);

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// FIREBASE / GOOGLE AUTH (find-or-create by firebaseUid)
router.post("/firebase-auth", firebaseAuth);

// UPDATE user (own profile) – must be logged in
router.put("/:id", verifyToken, updateUser);

module.exports = router;
