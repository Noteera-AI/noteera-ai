// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6kS4cXPzN7ujKXUCukt-qPr_fpqjbdWc",
  authDomain: "noteera-a85f1.firebaseapp.com",
  projectId: "noteera-a85f1",
  storageBucket: "noteera-a85f1.firebasestorage.app",
  messagingSenderId: "12138703865",
  appId: "1:12138703865:web:2d53f66a7301a9b0aeab28",
  measurementId: "G-CB1EVF6VTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;