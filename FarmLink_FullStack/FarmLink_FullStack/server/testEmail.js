require("dotenv").config({ path: "./.env" });
const nodemailer = require("nodemailer");
const fs = require("fs");

console.log("\n=== FarmLink Gmail SMTP Test ===");
console.log("GMAIL_USER:", process.env.GMAIL_USER || "❌ NOT SET");
console.log("GMAIL_APP_PASS:", process.env.GMAIL_APP_PASS && process.env.GMAIL_APP_PASS !== 'your-16-char-app-password-here'
    ? `✅ SET (${process.env.GMAIL_APP_PASS.length} chars)`
    : "❌ NOT SET or placeholder");
console.log("================================\n");

if (!process.env.GMAIL_APP_PASS || process.env.GMAIL_APP_PASS === 'your-16-char-app-password-here') {
    console.log("⚠️  Please set GMAIL_APP_PASS in .env first!");
    console.log("   1. Go to: https://myaccount.google.com/apppasswords");
    console.log("   2. Create an app password for 'FarmLink'");
    console.log("   3. Paste the 16-char password into GMAIL_APP_PASS in .env");
    process.exit(0);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});

console.log("🔄 Testing Gmail SMTP connection...");
transporter.verify(function (error, success) {
    if (error) {
        const result = "FAIL\nCode: " + error.code + "\nMsg: " + error.message;
        fs.writeFileSync("smtpResult.txt", result);
        console.error("❌ Connection FAILED:", error.message);
        if (error.message.includes("Invalid login") || error.message.includes("Username and Password")) {
            console.log("\n🔑 SOLUTION: App Password is wrong.");
            console.log("   1. Go to https://myaccount.google.com/apppasswords");
            console.log("   2. Delete old 'FarmLink' entry and create a new one");
            console.log("   3. Copy the 16-char password (no spaces) into GMAIL_APP_PASS");
        }
    } else {
        console.log("✅ Gmail SMTP Connected! Sending test email...");
        transporter.sendMail({
            from: `FarmLink <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: "✅ FarmLink Email Test - Working!",
            html: `<div style="font-family:Arial;padding:20px;background:#f5f7f0">
                     <h2 style="color:#2d6a4f">🌱 FarmLink Email is Working!</h2>
                     <p>Gmail SMTP is configured correctly.</p>
                     <p>Customers will now receive order notifications and registration emails.</p>
                   </div>`
        }).then(info => {
            fs.writeFileSync("smtpResult.txt", "SUCCESS! MessageId: " + info.messageId);
            console.log("✅ Test email sent! Check your inbox at:", process.env.GMAIL_USER);
            console.log("   MessageId:", info.messageId);
        }).catch(err => {
            fs.writeFileSync("smtpResult.txt", "SEND_FAIL: " + err.message);
            console.error("❌ Send failed:", err.message);
        });
    }
});
