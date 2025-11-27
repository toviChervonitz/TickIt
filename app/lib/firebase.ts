// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: process.env.FIREBASE_API_KEY,
  // authDomain: process.env.AUTH_DOMAIN,
  // projectId: process.env.PROJECT_ID, 
  // storageBucket: process.env.STORAGE_BUCKET,
  // messagingSenderId: process.env.MESSAGING_SENDER_ID,
  // appId: process.env.FIREBASE_APP_ID,
  // measurementId: process.env.MEASUREMENT_ID,
  apiKey: "AIzaSyDaDIHNgiQ5dSyvAGL3J_8U0l9E6NNXkHo",
  authDomain: "tickit-8a015.firebaseapp.com",
  projectId: "tickit-8a015",
  storageBucket: "tickit-8a015.firebasestorage.app",
  messagingSenderId: "700224217230",
  appId: "1:700224217230:web:b771e44abe390ffb87e9df",
  measurementId: "G-HZ9V1KYYVQ",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { app };
