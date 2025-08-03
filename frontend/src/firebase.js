// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6pnq_tCgNbw98jTOi34oOS1z78hQ7ypY",
  authDomain: "medtrack-e1f79.firebaseapp.com",
  projectId: "medtrack-e1f79",
  storageBucket: "medtrack-e1f79.firebasestorage.app",
  messagingSenderId: "605757031137",
  appId: "1:605757031137:web:3e0c89653b78f50f4eada0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);