const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  tags: [String],
  
  // Farmer Info
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmerName: { type: String, required: true },
  location: { type: String, required: true },
  
  // Media
  image: { type: String, required: true }, // Primary image
  images: [String], // Additional images/videos
  
  // Stats
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
