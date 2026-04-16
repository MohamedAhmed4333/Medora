import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyADaYRojtiCN4RinmTez4FIlerWd78XuFo",
  authDomain: "medora-test.firebaseapp.com",
  projectId: "medora-test",
  storageBucket: "medora-test.firebasestorage.app",
  messagingSenderId: "704965256389",
  appId: "1:704965256389:web:e4e84ad5f622d2feebbcac",
  measurementId: "G-Z73E2Y7XRR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);