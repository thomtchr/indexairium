// ═══════════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION — Replace with YOUR project credentials
// ═══════════════════════════════════════════════════════════════
// 
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add project" → name it "indexairium"
// 3. Go to Project Settings → General → scroll to "Your apps"
// 4. Click the web icon (</>)  → register app
// 5. Copy the config values below
// 6. Go to Authentication → Sign-in method → Enable "Email/Password" AND "Google"
//
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
