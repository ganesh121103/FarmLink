// run this with: node generate_base64.js "path/to/your/firebase-adminsdk.json"
const fs = require('fs');

const filepath = process.argv[2];

if (!filepath) {
    console.error("❌ Please provide the path to your downloaded JSON file.");
    console.error(`Example: node generate_base64.js "C:\\Users\\ganes\\Downloads\\farmlink-firebase-adminsdk.json"`);
    process.exit(1);
}

try {
    const data = fs.readFileSync(filepath, 'utf8');
    const base64String = Buffer.from(data).toString('base64');
    console.log("\n✅ SUCCESS! Copy the string below and paste it into server/.env as FIREBASE_SERVICE_ACCOUNT_BASE64:\n");
    console.log(base64String);
    console.log("\n");
} catch (err) {
    console.error("❌ Error reading file:", err.message);
}
