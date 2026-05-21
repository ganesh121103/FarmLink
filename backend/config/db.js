const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_ATLAS_URI || process.env.MONGO_URI;
    
    // Write current URI to log for debugging (ignored by nodemon)
    const logPath = path.join(__dirname, "../logs/current_mongo_uri.txt");
    if (!fs.existsSync(path.join(__dirname, "../logs"))) {
      fs.mkdirSync(path.join(__dirname, "../logs"), { recursive: true });
    }
    fs.writeFileSync(logPath, MONGO_URI);

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
