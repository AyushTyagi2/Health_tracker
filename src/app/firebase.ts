// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZT4etdOb75OPSaK3V1oXU4kEXjAqhxQA",
  authDomain: "health-8ef1d.firebaseapp.com",
  projectId: "health-8ef1d",
  storageBucket: "health-8ef1d.firebasestorage.app",
  messagingSenderId: "833775438123",
  appId: "1:833775438123:web:80dcbb611e9e49d211dd6e",
  measurementId: "G-TBV54CTCQF"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };