const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Farmer = require('./models/Farmer');
const Admin = require('./models/Admin');
require('dotenv').config();

async function migrateData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://pratik123:pratik123@cluster0.zbiymel.mongodb.net/?appName=Cluster0';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    
    console.log('Starting Migration...');

    // 1. Fetch ALL documents masquerading as customers
    const allCustomers = await Customer.find({});
    console.log(`Found ${allCustomers.length} total users in Customer collection.`);

    let farmersMigrated = 0;
    let adminsMigrated = 0;

    for (let user of allCustomers) {
      if (user.role === 'farmer') {
        const existing = await Farmer.findOne({ email: user.email });
        if (!existing) {
          await Farmer.create({
            _id: user._id, // Retain ID for foreign key references
            name: user.name,
            email: user.email,
            password: user.password,
            firebaseUid: user.firebaseUid,
            role: user.role,
            phone: user.phone || "",
            address: user.address || "",
            location: user.address || "",
            specialization: user.specialization || "Mixed Crops",
            bio: user.bio || "",
            verified: user.verified || false,
            verificationStatus: user.verificationStatus || "Unverified",
            image: user.image || "",
            documents: user.documents || {}
          });
          farmersMigrated++;
        }
        // Remove from customers
        await Customer.findByIdAndDelete(user._id);
        
      } else if (user.role === 'admin') {
        const existing = await Admin.findOne({ email: user.email });
        if (!existing) {
          await Admin.create({
            _id: user._id, 
            name: user.name,
            email: user.email,
            password: user.password,
            firebaseUid: user.firebaseUid,
            role: user.role,
            phone: user.phone || "",
            address: user.address || "",
            image: user.image || ""
          });
          adminsMigrated++;
        }
        // Remove from customers
        await Customer.findByIdAndDelete(user._id);
      }
    }

    console.log(`Migration Complete ✅`);
    console.log(`Farmers successfully migrated: ${farmersMigrated}`);
    console.log(`Admins successfully migrated: ${adminsMigrated}`);
    
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrateData();
