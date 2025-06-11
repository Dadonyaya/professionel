import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const BACKEND_URL = process.env.REACT_APP_API_URL;
console.log("📦 BACKEND_URL =", BACKEND_URL);

const firebaseConfig = {
  apiKey: "AIzaSyDf1cBlLMSRpw26yIaCYR24FpaT-DS9oCY",
  authDomain: "rama-a1c25.firebaseapp.com",
  projectId: "rama-a1c25",
  storageBucket: "rama-a1c25.appspot.com",
  messagingSenderId: "327469615923",
  appId: "1:327469615923:web:7e0632d61f882f4c320c46"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);
