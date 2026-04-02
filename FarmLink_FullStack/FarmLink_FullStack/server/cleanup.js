const mongoose = require('mongoose');
require('dotenv').config();

async function cleanGhostCollections() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://pratik123:pratik123@cluster0.zbiymel.mongodb.net/?appName=Cluster0';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    
    const db = mongoose.connection.db;

    // List of collections we want to drop because they don't exist in the codebase models
    const collectionsToDrop = ['farmerprofiles', 'transactions', 'users'];

    for (let colName of collectionsToDrop) {
      try {
        await db.collection(colName).drop();
        console.log(`✅ Successfully dropped legacy collection: ${colName}`);
      } catch (e) {
        if (e.codeName === 'NamespaceNotFound') {
          console.log(`- Collection ${colName} already dropped or doesn't exist.`);
        } else {
          console.error(`❌ Failed to drop ${colName}:`, e.message);
        }
      }
    }

    console.log("Cleanup Complete! You can refresh MongoDB Compass.");
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    process.exit(0);
  }
}

cleanGhostCollections();
