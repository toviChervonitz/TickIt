import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDaDIHNgiQ5dSyvAGL3J_8U0l9E6NNXkHo",
  authDomain: "tickit-8a015.firebaseapp.com",
  projectId: "tickit-8a015",
  storageBucket: "tickit-8a015.firebasestorage.app",
  messagingSenderId: "700224217230",
  appId: "1:700224217230:web:b771e44abe390ffb87e9df",
  measurementId: "G-HZ9V1KYYVQ",
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { app };
