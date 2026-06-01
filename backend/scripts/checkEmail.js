const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
const OTP = require("../models/OTP");
require("dotenv").config({ path: ".env" });

const email = process.argv[2];

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS_URI);
        
        let c = await Customer.findOne({ email });
        let f = await Farmer.findOne({ email });
        let a = await Admin.findOne({ email });
        let o = await OTP.findOne({ email });
        
        console.log(`Customer: ${!!c}`);
        console.log(`Farmer: ${!!f}`);
        console.log(`Admin: ${!!a}`);
        console.log(`OTP: ${!!o}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

check();
