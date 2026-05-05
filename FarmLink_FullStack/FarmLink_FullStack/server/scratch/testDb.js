const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;
console.log("URI:", uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log("✅ MongoDB Connected successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
