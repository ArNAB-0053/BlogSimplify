import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAj8cAKIEc44mEIxJQ6D7IAuwFtsqh3lP0",
    authDomain: "internproject-5d594.firebaseapp.com",
    projectId: "internproject-5d594",
    storageBucket: "internproject-5d594.appspot.com",
    messagingSenderId: "849683269988",
    appId: "1:849683269988:web:8f36f40cdd0b3e5ad3d271"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export { db, storage }