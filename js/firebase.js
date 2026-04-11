/**
 * ScoutMe v2 — Firebase and Pi bootstrap.
 * Firebase Auth is used after Pi Network authentication to protect Firestore.
 */
window.SCOUTME_CONFIG = window.SCOUTME_CONFIG || {
  firebase: {
    apiKey: "AIzaSyCmKZOO4wB78Clh_mFb8GrENpsPeZWqPx8",
  authDomain: "scoutme-8b871.firebaseapp.com",
  databaseURL: "https://scoutme-8b871-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "scoutme-8b871",
  storageBucket: "scoutme-8b871.firebasestorage.app",
  messagingSenderId: "251338951370",
  appId: "1:251338951370:web:8dbcb8b432f6fc0cee4233",
  measurementId: "G-D444PJXPTM"
};
  pi: {
    sandbox: false, // Set to false for Mainnet
    version: "2.0"
  },
  wallet: "GC7KBK7553NTMDD4O6OJBUY2QOPSVW7SKXWOJITVMKPIVD6ZDSPMGWPH"
};

window.ScoutMeFirebase = (() => {
  let app;
  let db;
  let auth;
  let piReady = false;
  let persistenceAttempted = false;


  function initFirebase() {
    if (app) return { app, db, auth };


    if (!window.firebase) throw new Error("Firebase SDK is missing on this page.");

    if (!firebase.apps.length) {
      app = firebase.initializeApp(window.SCOUTME_CONFIG.firebase);
    } else {
      app = firebase.app();
    }

    db = firebase.firestore();
    auth = firebase.auth();

    if (!persistenceAttempted) {
      persistenceAttempted = true;
      db.enablePersistence({ synchronizeTabs: true }).catch((error) => {
        console.warn("Firestore persistence was not enabled.", error && error.code ? error.code : error);
      });
    }

    return { app, db, auth };
  }

  function initPi() {
    if (piReady) return true;
    if (!window.Pi) {
      console.warn("Pi SDK not detected. Open inside Pi Browser for full auth and payments.");
      return false;
    }
    Pi.init({ version: window.SCOUTME_CONFIG.pi.version, sandbox: !!window.SCOUTME_CONFIG.pi.sandbox });
    piReady = true;
    return true;
  }

  function requirePiBrowser() {
    return !!window.Pi;
  }

  function getDB() { return db || initFirebase().db; }
  function getAuth() { return auth || initFirebase().auth; }
  function serverTimestamp() { return firebase.firestore.FieldValue.serverTimestamp(); }
  function increment(number) { return firebase.firestore.FieldValue.increment(number); }
  function arrayUnion(...items) { return firebase.firestore.FieldValue.arrayUnion(...items); }
  function arrayRemove(...items) { return firebase.firestore.FieldValue.arrayRemove(...items); }

  return {
    initFirebase,
    initPi,
    requirePiBrowser,
    getDB,
    getAuth,
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  try {
    window.ScoutMeFirebase.initFirebase();
    window.ScoutMeFirebase.initPi();
  } catch (error) {
    console.warn("ScoutMe bootstrap warning", error);
  }
});
