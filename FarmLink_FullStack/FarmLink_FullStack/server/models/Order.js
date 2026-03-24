const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    userName: { type: String, required: true },
    address: { type: String, required: true },
    
    date: { type: String }, // To explicitly store the formatted date from frontend
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
        farmerName: { type: String, required: true },
        image: { type: String }
      }
    ],
    
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "upi" },
    status: { 
        type: String, 
        enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: "Placed" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
