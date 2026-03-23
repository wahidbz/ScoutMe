import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged, signInAnonymously, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCmKZOO4wB78Clh_mFb8GrENpsPeZWqPx8",
  authDomain: "scoutme-8b871.firebaseapp.com",
  databaseURL: "https://scoutme-8b871-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "scoutme-8b871",
  storageBucket: "scoutme-8b871.firebasestorage.app",
  messagingSenderId: "251338951370",
  appId: "1:251338951370:web:8dbcb8b432f6fc0cee4233",
  measurementId: "G-D444PJXPTM"
};

export const firebaseConfig = window.SCOUTME_FIREBASE_CONFIG || fallbackConfig;
export const firebaseConfigured = !Object.values(firebaseConfig).some((value) => String(value).startsWith('REPLACE_WITH_'));

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.warn);
enableIndexedDbPersistence(db).catch(console.warn);

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  writeBatch,
  onAuthStateChanged,
  signInAnonymously,
  signOut
};
