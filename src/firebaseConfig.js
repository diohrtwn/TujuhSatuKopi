// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdmBfiTFW7WMszLv-a1x5NzzfOFupofGA",
    authDomain: "tujuhsatukopi-coffeeshop.firebaseapp.com",
    projectId: "tujuhsatukopi-coffeeshop",
    storageBucket: "tujuhsatukopi-coffeeshop.appspot.com",
    messagingSenderId: "750908139116",
    appId: "1:750908139116:web:4a82e9d33adb0ce8d01a49",
    measurementId: "G-0JGFNHJRJE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const authFirebase = getAuth(app);
const storeFirebase = getFirestore(app);
const storageFirebase = getStorage(app); // Initialize Firebase Storage

export { app, authFirebase, storeFirebase, storageFirebase };
