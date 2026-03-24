const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // ❌ REMOVE unique (important for your case)
  email: { type: String, required: true },

  password: { type: String, required: true },

  role: { type: String, default: "customer" },

  // ✅ ADD DEFAULTS (prevents undefined issues)
  phone: { type: String, default: "" },

  address: { type: String, default: "" }, // ✅ ADD THIS

  bio: { type: String, default: "" },

  specialization: { type: String, default: "" },

  // ✅ PROFILE IMAGE
  image: { type: String, default: "" },

  // ✅ VERIFICATION (for farmers registered via AuthView)
  verified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
    default: 'Unverified'
  },
  documents: {
    idProof: { type: String, default: '' },
    landRecord: { type: String, default: '' }
  }

}, { timestamps: true });

// Index for fast login lookups
customerSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model("Customer", customerSchema);