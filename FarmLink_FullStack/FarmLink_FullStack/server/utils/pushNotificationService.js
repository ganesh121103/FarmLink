const admin = require("firebase-admin");

let isInitialized = false;

const initFirebaseAdmin = () => {
    if (isInitialized || admin.apps.length > 0) return;

    try {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
             console.warn("⚠️ FCM Push Notifications disabled: FIREBASE_SERVICE_ACCOUNT_BASE64 is missing in .env. Will use fallback console logs.");
             isInitialized = true; 
             return;
        }

        const serviceAccount = JSON.parse(
             Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isInitialized = true;
        console.log("✅ Firebase Admin (FCM) tracking initialized");
    } catch (err) {
        console.error("❌ Firebase Admin Initialization Error:", err.message);
    }
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    initFirebaseAdmin();

    try {
        if (!fcmToken) {
            console.log("\n=======================================================");
            console.log("📱 [MOCK PUSH NOTIFICATION] (User missing fcmToken)");
            console.log(`Title: ${title}`);
            console.log(`Body:  ${body}`);
            console.log("=======================================================\n");
            return false;
        }

        if (!admin.apps.length) {
            console.log("\n=======================================================");
            console.log("📱 [MOCK PUSH NOTIFICATION] (Firebase Admin not setup)");
            console.log(`To:    ${fcmToken}`);
            console.log(`Title: ${title}`);
            console.log(`Body:  ${body}`);
            console.log("=======================================================\n");
            return false;
        }

        const payload = {
            notification: { title, body },
            data: {
                type: data.type || "General",
                link: data.link || ""
            },
            token: fcmToken
        };

        const response = await admin.messaging().send(payload);
        console.log(`✅ Push Notification sent successfully: ${response}`);
        return true;
    } catch (error) {
        console.error("❌ Push Notification Error:", error.message);
        return false;
    }
};

module.exports = { sendPushNotification };
