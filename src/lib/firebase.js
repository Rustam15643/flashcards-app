import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgwRPKHbBzp5cfmxjqcXJIjINZHg4Zzmg",
  authDomain: "flashcards-app-f5c07.firebaseapp.com",
  projectId: "flashcards-app-f5c07",
  storageBucket: "flashcards-app-f5c07.firebasestorage.app",
  messagingSenderId: "302820752958",
  appId: "1:302820752958:web:97e78d8ecb3a28b7679b6f",
  measurementId: "G-VYMYHLT2FD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
