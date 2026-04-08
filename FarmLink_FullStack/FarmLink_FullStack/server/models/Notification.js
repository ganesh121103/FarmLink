const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String, default: "" },
    link: { type: String, default: "" }, // product _id to navigate to
    type: {
      type: String,
      enum: ["Wishlist", "Recommendation", "Order", "System"],
      default: "System",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
