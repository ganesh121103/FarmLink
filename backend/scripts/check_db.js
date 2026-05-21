require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Farmer = require('../models/Farmer');

const run = async () => {
    try {
        const MONGO_URI = process.env.MONGO_ATLAS_URI || process.env.MONGO_URI;
        console.log("Connecting to:", MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully!");

        const productCount = await Product.countDocuments();
        console.log("Total products in database:", productCount);

        const products = await Product.find().limit(5);
        console.log("Sample products:");
        products.forEach(p => {
            console.log(`- ID: ${p._id}, Name: ${p.name}, Farmer: ${p.farmerName}, Ref: ${p.farmer}`);
        });

        const adminCount = await Admin.countDocuments();
        console.log("Total admins:", adminCount);
        const admins = await Admin.find();
        admins.forEach(a => {
            console.log(`- Admin ID: ${a._id}, Email: ${a.email}, Name: ${a.name}`);
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
