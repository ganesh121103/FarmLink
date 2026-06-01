const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  userData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Expires in 600 seconds (10 minutes)
});

// Index for fast lookups
otpSchema.index({ email: 1 });

module.exports = mongoose.model("OTP", otpSchema);
