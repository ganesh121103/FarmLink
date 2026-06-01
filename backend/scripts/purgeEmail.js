/**
 * Usage: node scripts/purgeEmail.js <email>
 * Completely removes an email from ALL collections (Customer, Farmer, Admin, OTP).
 * Use this when you manually deleted a user from Firebase/MongoDB and want to re-register.
 */

const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
const OTP = require("../models/OTP");
require("dotenv").config({ path: ".env" });

const email = process.argv[2];

if (!email) {
    console.error("❌ Usage: node scripts/purgeEmail.js <email>");
    process.exit(1);
}

const purge = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS_URI);
        console.log(`\n🔍 Searching for: ${email}\n`);

        const cResult = await Customer.deleteMany({ email });
        const fResult = await Farmer.deleteMany({ email });
        const aResult = await Admin.deleteMany({ email });
        const oResult = await OTP.deleteMany({ email });

        console.log(`Customer  → deleted ${cResult.deletedCount} record(s)`);
        console.log(`Farmer    → deleted ${fResult.deletedCount} record(s)`);
        console.log(`Admin     → deleted ${aResult.deletedCount} record(s)`);
        console.log(`OTP       → deleted ${oResult.deletedCount} record(s)`);

        const total = cResult.deletedCount + fResult.deletedCount + aResult.deletedCount + oResult.deletedCount;
        if (total === 0) {
            console.log(`\n⚠️  No records found for ${email}. It may already be clean.`);
        } else {
            console.log(`\n✅ Successfully purged ${total} record(s) for ${email}. You can now re-register.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Purge failed:", error.message);
        process.exit(1);
    }
};

purge();
