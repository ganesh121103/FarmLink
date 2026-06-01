const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
const OTP = require("../models/OTP");
require("dotenv").config({ path: ".env" });

const email = process.argv[2];

const search = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS_URI);
        
        let c = await Customer.findOne({ email });
        if(c) console.log("Found Customer:", c);
        else console.log("Not found in Customer");

        let f = await Farmer.findOne({ email });
        if(f) console.log("Found Farmer:", f);
        else console.log("Not found in Farmer");

        let a = await Admin.findOne({ email });
        if(a) console.log("Found Admin:", a);
        else console.log("Not found in Admin");

        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

search();
