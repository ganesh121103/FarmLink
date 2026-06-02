const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@farmlink.com";
    const password = "adminpassword123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert admin account
    await Admin.findOneAndUpdate(
      { email },
      {
        name: "Super Admin",
        email: email,
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
      },
      { upsert: true, new: true }
    );

    console.log("===================================");
    console.log("✅ Admin account configured successfully!");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("===================================");

    process.exit();
  } catch (err) {
    console.error("Error creating/updating admin:", err);
    process.exit(1);
  }
};

createAdmin();
