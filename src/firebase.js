// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCM6-ELuPxdNQbcqKkDRzRqL-ZIGeyzXak",
  authDomain: "farmlink-2c3d6.firebaseapp.com",
  projectId: "farmlink-2c3d6",
  storageBucket: "farmlink-2c3d6.firebasestorage.app",
  messagingSenderId: "49181203415",
  appId: "1:49181203415:web:25e5d3eb68ab8cc4200992",
  measurementId: "G-2P02M447SS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
let messaging = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  messaging = getMessaging(app);
}

// Push Notification Helper
export const requestForToken = async () => {
  try {
    if (!messaging) return null;
    
    const currentToken = await getToken(messaging, { 
      // Replace with your VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web
      vapidKey: "BKZLI5cq-sU9ZCw8_jB92PJs6HBrKMXjlxYxnc14UnxSMqNOucLRNPGhpE3-Ukxj0sLaZ6xXj5AENOfdab52m0M" 
    });
    
    if (currentToken) {
      console.log("✅ FCM Token established:", currentToken.substring(0,10) + "...");
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { auth, messaging };
export default app;
