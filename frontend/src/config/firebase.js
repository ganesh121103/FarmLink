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
// Requests browser notification permission and retrieves the FCM token
export const requestForToken = async () => {
  try {
    if (!messaging) return null;

    // Explicitly request browser notification permission before calling getToken
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Notification permission denied by user.");
      return null;
    }
    
    const currentToken = await getToken(messaging, { 
      vapidKey: "BKZLI5cq-sU9ZCw8_jB92PJs6HBrKMXjlxYxnc14UnxSMqNOucLRNPGhpE3-Ukxj0sLaZ6xXj5AENOfdab52m0M" 
    });
    
    if (currentToken) {
      console.log("✅ FCM Token established:", currentToken.substring(0,10) + "...");
      return currentToken;
    } else {
      console.log("⚠️ No FCM token available. Ensure the service worker is registered.");
      return null;
    }
  } catch (err) {
    if (err.code === 'messaging/permission-blocked') {
      console.warn("🔔 Push Notifications: Permission blocked or denied by user (Safe to ignore).");
    } else {
      console.error("❌ FCM token error:", err);
    }
    return null;
  }
};

/**
 * Registers a persistent foreground message listener.
 * Unlike a one-shot Promise, this callback fires for every message received
 * while the app is in the foreground.
 * @param {Function} callback - Called with payload on each new message
 * @returns {Function} unsubscribe - Call to stop listening
 */
export const onMessageListener = (callback) => {
  if (!messaging || typeof callback !== "function") return () => {};
  // onMessage returns an unsubscribe function
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export { auth, messaging };
export default app;
