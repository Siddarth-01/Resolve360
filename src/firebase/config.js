import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNTmF6WCyH_wcnbhBDBTFX7plv2x9Id60",
  authDomain: "insta-maintain.firebaseapp.com",
  projectId: "insta-maintain",
  storageBucket: "insta-maintain.firebasestorage.app",
  messagingSenderId: "431949036005",
  appId: "1:431949036005:web:0bf7515b195c2b4342d70c",
  measurementId: "G-JGDVKXK6LB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
