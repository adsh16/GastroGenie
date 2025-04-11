// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBUf7tM0e5zB8aN5a9BY48c8z_4VAuTBnU",
    authDomain: "gastrogenie-7d653.firebaseapp.com",
    projectId: "gastrogenie-7d653",
    storageBucket: "gastrogenie-7d653.firebasestorage.app",
    messagingSenderId: "1043241823263",
    appId: "1:1043241823263:web:2c75792750c53fa462792a",
    measurementId: "G-CGMKNPF8P1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };