const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
const OTP = require("../models/OTP");
require("dotenv").config({ path: ".env" });

const email = process.argv[2];

const purge = async () => {
    try {
        await mongoose.connect(process.env.MONGO_LOCAL_URI);
        
        // Case-insensitive regex search
        const regex = new RegExp(`^${email}$`, "i");

        const cResult = await Customer.deleteMany({ email: regex });
        const fResult = await Farmer.deleteMany({ email: regex });
        const aResult = await Admin.deleteMany({ email: regex });
        const oResult = await OTP.deleteMany({ email: regex });

        console.log(`Customer  → deleted ${cResult.deletedCount}`);
        console.log(`Farmer    → deleted ${fResult.deletedCount}`);
        console.log(`Admin     → deleted ${aResult.deletedCount}`);
        console.log(`OTP       → deleted ${oResult.deletedCount}`);

        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

purge();
