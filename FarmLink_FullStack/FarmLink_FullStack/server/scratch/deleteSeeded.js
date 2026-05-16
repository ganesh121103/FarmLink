const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    const db = mongoose.connection.db;

    const idsToDelete = [
        '69fb8701c2857dac2fe83a74', // Fresh Organic Tomatoes
        '69fb8701c2857dac2fe83a76', // Nashik Thompson Grapes
        '69fb8701c2857dac2fe83a77', // Alphonso Mangoes (1 dozen)
        '6a02ac7f2d79afdc06486604', // Wheat
    ];

    const objectIds = idsToDelete.map(id => new mongoose.Types.ObjectId(id));
    const result = await db.collection('products').deleteMany({ _id: { $in: objectIds } });
    console.log('Deleted:', result.deletedCount, 'seeded products');

    const remaining = await db.collection('products').find({}).project({ name: 1, farmerName: 1 }).toArray();
    console.log('\nRemaining products in database:');
    remaining.forEach(p => console.log('  -', p.name, '| Farmer:', p.farmerName));

    await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
