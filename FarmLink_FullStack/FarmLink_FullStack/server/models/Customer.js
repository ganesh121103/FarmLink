const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // ❌ REMOVE unique (important for your case)
  email: { type: String, required: true },

  // Password is optional for Google/Firebase-authenticated users
  password: { type: String, default: "" },

  // Firebase UID for Google sign-in users
  firebaseUid: { type: String, default: "" },

  role: { type: String, default: "customer" },

  // ✅ ADD DEFAULTS (prevents undefined issues)
  phone: { type: String, default: "" },

  address: { type: String, default: "" }, // ✅ ADD THIS

  bio: { type: String, default: "" },

  specialization: { type: String, default: "" },

  // ✅ PROFILE IMAGE
  image: { type: String, default: "" },

  // Firebase Cloud Messaging Device Token for Push Notifications
  fcmToken: { type: String, default: "" },

  // ✅ WISHLIST — array of Product ObjectIds
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

}, { timestamps: true });

// Index for fast login lookups
customerSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model("Customer", customerSchema);