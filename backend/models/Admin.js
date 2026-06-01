const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  firebaseUid: { type: String, default: "" },
  role: { type: String, default: "admin" },
  emailVerified: { type: Boolean, default: false },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  image: { type: String, default: "" },

  // Firebase Cloud Messaging token (admins can receive push notifications)
  fcmToken: { type: String, default: "" },

  // ✅ PASSWORD RESET
  passwordResetToken: { type: String, default: "" },
  passwordResetExpires: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
