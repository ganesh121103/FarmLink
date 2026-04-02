// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

export { auth };
export default app;
