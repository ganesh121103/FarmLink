const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "farmer" },
  phone: String,
  location: String,
  
  // Farmer specific fields
  specialization: { type: String, default: 'Mixed Crops' },
  bio: String,
  verified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
    default: 'Unverified'
  },
  documents: {
    idProof: String,
    landRecord: String
  },
  image: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
