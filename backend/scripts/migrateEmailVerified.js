const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Farmer = require("../models/Farmer");
const Admin = require("../models/Admin");
require("dotenv").config({ path: "../.env" });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB for migration");

        const models = [Customer, Farmer, Admin];
        for (const Model of models) {
            const result = await Model.updateMany(
                { emailVerified: { $exists: false } },
                { $set: { emailVerified: true } }
            );
            console.log(`Updated ${result.modifiedCount} documents in ${Model.modelName} collection.`);
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
