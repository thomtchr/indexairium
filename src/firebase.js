import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfowPWknqVj0LIa4sdR3MAa4UufLvj_tk",
  authDomain: "indexairium.firebaseapp.com",
  projectId: "indexairium",
  storageBucket: "indexairium.firebasestorage.app",
  messagingSenderId: "552632156202",
  appId: "1:552632156202:web:d94e3b8ee92d65af4f4353"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

export default app;
