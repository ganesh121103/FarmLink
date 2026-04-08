require("dotenv").config({ path: "./.env" });
const { sendPushNotification } = require("./utils/pushNotificationService");
const mongoose = require("mongoose");
const User = require("./models/Customer");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    console.log("Connected to MongoDB.");
    // Find customer with the target email
    const customer = await User.findOne({ email: "pratikpawar0603@gmail.com" });
    if (!customer) {
        console.log("Customer not found.");
        process.exit();
    }
    console.log("Customer fcmToken:", customer.fcmToken);

    if (customer.fcmToken) {
        console.log("Attempting push notification...");
        await sendPushNotification(customer.fcmToken, "Test Title", "Test Body");
        console.log("Push sent correctly!");
    } else {
        console.log("No FCM token found for user in database.");
    }
    process.exit();
})
.catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
});
