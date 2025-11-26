// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "tickit-8a015.firebaseapp.com",
  projectId: "tickit-8a015",
  storageBucket: "tickit-8a015.firebasestorage.app",
  messagingSenderId: "700224217230",
  appId: "1:700224217230:web:b771e44abe390ffb87e9df",
  measurementId: "G-HZ9V1KYYVQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);