const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUsers
} = require("../controllers/userController");

// 🔥 GET ALL USERS OR FILTER BY ROLE (?role=farmer)
router.get("/", getUsers);

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

module.exports = router;
