// Firebase Authentication helper functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

// ─── Check for Google Redirect Result (call on app init) ─────────────────────
export const checkGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("✅ Google redirect sign-in:", result.user.email);
      return { user: result.user, error: null };
    }
    return { user: null, error: null };
  } catch (error) {
    console.error("❌ Google redirect error:", error.message);
    return { user: null, error: getFirebaseErrorMessage(error.code) };
  }
};

// ─── Email/Password Registration ─────────────────────────────────────────────
export const registerWithEmail = async (email, password, displayName = "") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set the display name if provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    console.log("✅ User registered:", userCredential.user.email);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return { user: null, error: getFirebaseErrorMessage(error.code) };
  }
};

// ─── Email/Password Login ────────────────────────────────────────────────────
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ User logged in:", userCredential.user.email);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return { user: null, error: getFirebaseErrorMessage(error.code) };
  }
};

// ─── Google Sign-In (with redirect fallback) ─────────────────────────────────
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    // Try popup first (preferred, faster UX)
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Google sign-in:", result.user.email);
    return { user: result.user, error: null };
  } catch (error) {
    // If popup is blocked, fall back to redirect
    if (error.code === "auth/popup-blocked") {
      console.warn("⚠️ Popup blocked — falling back to redirect sign-in...");
      try {
        await signInWithRedirect(auth, provider);
        // Page will redirect, so this return won't execute
        return { user: null, error: null };
      } catch (redirectError) {
        console.error("❌ Redirect sign-in error:", redirectError.message);
        return { user: null, error: getFirebaseErrorMessage(redirectError.code) };
      }
    }
    console.error("❌ Google sign-in error:", error.message);
    // User closed the popup
    if (error.code === "auth/popup-closed-by-user") {
      return { user: null, error: null };
    }
    return { user: null, error: getFirebaseErrorMessage(error.code) };
  }
};

// ─── Sign Out ────────────────────────────────────────────────────────────────
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
    console.log("✅ User signed out");
    return { error: null };
  } catch (error) {
    console.error("❌ Sign-out error:", error.message);
    return { error: error.message };
  }
};

// ─── Auth State Listener ─────────────────────────────────────────────────────
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("🔵 Auth state: Logged in as", user.email);
    } else {
      console.log("🔵 Auth state: No user");
    }
    callback(user);
  });
};

// ─── Friendly Error Messages ─────────────────────────────────────────────────
const getFirebaseErrorMessage = (errorCode) => {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Please login instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/user-disabled": "This account has been disabled.",
  };
  return messages[errorCode] || "Authentication failed. Please try again.";
};
