/**
 * FarmLink - Forgot Password Diagnostic Test
 * Run: node testForgotPassword.js
 */
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("./models/Customer");
const Farmer = require("./models/Farmer");
const Admin = require("./models/Admin");

const EMAIL_TO_TEST = process.env.GMAIL_USER; // sends to self as a test

async function run() {
  console.log("\n🔍 FarmLink - Forgot Password Diagnostic\n" + "=".repeat(45));

  // 1️⃣ Check env vars
  console.log("\n[1] Environment variables:");
  console.log("  GMAIL_USER    :", process.env.GMAIL_USER || "❌ MISSING");
  console.log("  GMAIL_APP_PASS:", process.env.GMAIL_APP_PASS ? `✅ set (${process.env.GMAIL_APP_PASS.length} chars)` : "❌ MISSING");
  console.log("  MONGO_URI     :", process.env.MONGO_URI ? "✅ set" : "❌ MISSING");

  // 2️⃣ Test SMTP connection
  console.log("\n[2] Testing SMTP connection...");
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
    await transporter.verify();
    console.log("  ✅ SMTP connection verified!");
  } catch (err) {
    console.error("  ❌ SMTP connection FAILED:", err.message);
    console.log("\n  💡 Possible fixes:");
    console.log("     - Make sure 2-Step Verification is ON for Gmail");
    console.log("     - Use an App Password (not your normal Gmail password)");
    console.log("     - Go to: https://myaccount.google.com/apppasswords");
    process.exit(1);
  }

  // 3️⃣ Send a test email
  console.log("\n[3] Sending test password reset email to:", EMAIL_TO_TEST);
  const plainToken = crypto.randomBytes(32).toString("hex");
  try {
    const info = await transporter.sendMail({
      from: `FarmLink <${process.env.GMAIL_USER}>`,
      to: EMAIL_TO_TEST,
      subject: "🔐 FarmLink - Password Reset Test",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#2d6a4f;">🌱 FarmLink Password Reset Test</h2>
          <p>This is a diagnostic test email. Your reset token would be:</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;font-family:monospace;word-break:break-all;font-size:13px;">
            ${plainToken}
          </div>
          <p style="color:#888;font-size:12px;margin-top:16px;">If you received this, SMTP is working correctly!</p>
        </div>
      `,
    });
    console.log("  ✅ Email sent! Message ID:", info.messageId);
  } catch (err) {
    console.error("  ❌ Email send FAILED:", err.message);
    process.exit(1);
  }

  // 4️⃣ Test MongoDB user lookup
  console.log("\n[4] Testing MongoDB user lookup...");
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    console.log("  ✅ MongoDB connected");

    const emailRegex = new RegExp(`^${EMAIL_TO_TEST.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const models = [
      { name: "Customer", Model: Customer },
      { name: "Farmer", Model: Farmer },
      { name: "Admin", Model: Admin },
    ];

    let found = false;
    for (const { name, Model } of models) {
      const user = await Model.findOne({ email: emailRegex });
      if (user) {
        console.log(`  ✅ Found user in ${name} collection:`, user.name, "|", user.email);
        console.log("     Has password:", !!user.password);
        console.log("     Has firebaseUid:", !!user.firebaseUid);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`  ⚠️  No user found with email: ${EMAIL_TO_TEST}`);
      console.log("     (This is fine for the test — email was still sent above)");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("  ❌ MongoDB lookup FAILED:", err.message);
  }

  console.log("\n" + "=".repeat(45));
  console.log("✅ Diagnostic complete. Check your inbox!");
  console.log("=".repeat(45) + "\n");
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
