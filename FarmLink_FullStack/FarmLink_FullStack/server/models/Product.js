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
  reviewsCount: { type: Number, default: 0 },

  // User Reviews
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      userName: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true },
      isVerified: { type: Boolean, default: false },
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// Prevent duplicate reviews from the same user at the schema level
productSchema.pre('save', function() {
  if (this.isModified('reviews')) {
    const userIds = this.reviews.map(r => r.user.toString());
    const uniqueUserIds = new Set(userIds);
    if (userIds.length !== uniqueUserIds.size) {
      throw new Error('You have already reviewed this product.');
    }
  }
});

module.exports = mongoose.model("Product", productSchema);
