// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import{getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcCiqCiEQaQ3jobK4eU8YZsy5MtrxnAew",
  authDomain: "aiwoundmonitoringsys.firebaseapp.com",
  projectId: "aiwoundmonitoringsys",
  storageBucket: "aiwoundmonitoringsys.firebasestorage.app",
  messagingSenderId: "910115207647",
  appId: "1:910115207647:web:7eeb36a0fcef52b64f2c6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the app and services
export { app, auth, db, storage };