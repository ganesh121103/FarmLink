const mongoose = require("mongoose");
require("dotenv").config();
const Order = require("../models/Order");

async function testOrder() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const orderData = {
    userId: new mongoose.Types.ObjectId(), // fake
    userName: "Test User",
    address: "123 Test St",
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Test Potato",
        price: 150,
        quantity: 2,
        farmerName: "FarmLink Farmers",
        farmer: { _id: new mongoose.Types.ObjectId(), name: "Bob" }, // The object case
        image: "test.jpg"
      }
    ],
    total: 300,
    paymentMethod: "upi",
    status: "Placed",
    paymentStatus: "paid",
    razorpayOrderId: "order_test_123",
    razorpayPaymentId: "pay_test_xyz",
    razorpaySignature: "sig_123",
    date: new Date().toLocaleDateString(),
  };

  try {
    const order = await Order.create(orderData);
    console.log("Order created:", order._id);
  } catch (err) {
    console.error("Order.create ERROR:", err);
  }

  await mongoose.disconnect();
}

testOrder();
