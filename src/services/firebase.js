import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8R2LxfxFmRrb6BUt2JOvN-Z8ll4cEwi8",
  authDomain: "ak-academy-app.firebaseapp.com",
  projectId: "ak-academy-app",
  storageBucket: "ak-academy-app.firebasestorage.app",
  messagingSenderId: "354705877266",
  appId: "1:354705877266:web:dfc6040f7edbfe66146bcb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore (Database)
export const auth = getAuth(app);
export const db = getFirestore(app);