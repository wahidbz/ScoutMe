import { auth, onAuthStateChanged, signInAnonymously, signOut, serverTimestamp, firebaseConfigured } from '/js/firebase.js';
import { saveUser, getUser } from '/js/database.js';
import { WALLET_ADDRESS, toast } from '/js/utils.js';
import { getCurrentLanguage } from '/js/i18n.js';

let piInitialized = false;

export const initPiSdk = () => {
  if (piInitialized || !window.Pi) return;
  window.Pi.init({ version: '2.0', sandbox: ['localhost', '127.0.0.1'].includes(location.hostname) });
  piInitialized = true;
};

export const ensureFirebaseSession = async () => {
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
};

export const getSessionUser = () => auth.currentUser;

export const observeAuth = (callback) => onAuthStateChanged(auth, callback);

export const loginWithPi = async (overrides = {}) => {
  if (!firebaseConfigured) {
    toast('Add your Firebase web config first inside js/firebase.js or window.SCOUTME_FIREBASE_CONFIG.', 'error');
    throw new Error('Firebase config missing');
  }
  if (!window.Pi) {
    toast('Open ScoutMe inside Pi Browser to authenticate.', 'error');
    throw new Error('Pi SDK unavailable');
  }

  initPiSdk();
  const authResult = await window.Pi.authenticate(['username', 'payments'], async (payment) => payment);
  const firebaseUser = await ensureFirebaseSession();
  const existing = await getUser(firebaseUser.uid);
  const payload = {
    uid: firebaseUser.uid,
    username: authResult?.user?.username || authResult?.username || existing?.username || 'pi-user',
    piUid: authResult?.user?.uid || authResult?.uid || existing?.piUid || '',
    role: existing?.role || overrides.role || 'player',
    sport: existing?.sport || overrides.sport || 'Football',
    position: existing?.position || overrides.position || 'Athlete',
    country: existing?.country || overrides.country || 'Global',
    age: Number(existing?.age || overrides.age || 18),
    score: Number(existing?.score || 0),
    language: existing?.language || overrides.language || getCurrentLanguage(),
    verified: existing?.verified ?? false,
    wallet: existing?.wallet || WALLET_ADDRESS,
    createdAt: existing?.createdAt || serverTimestamp(),
    online: true,
    lastSeen: serverTimestamp(),
    onboardingComplete: existing?.onboardingComplete ?? false
  };
  await saveUser(firebaseUser.uid, payload);
  localStorage.setItem('scoutme_profile_uid', firebaseUser.uid);
  return payload;
};

export const getCurrentProfile = async () => {
  const user = auth.currentUser || await ensureFirebaseSession();
  if (!user) return null;
  return getUser(user.uid);
};

export const requireProfile = async () => {
  const user = auth.currentUser || await ensureFirebaseSession();
  if (!user) {
    location.href = '/public/login.html';
    return null;
  }
  const profile = await getUser(user.uid);
  if (!profile) {
    location.href = '/public/login.html';
    return null;
  }
  return profile;
};

export const updatePresence = async (online = true) => {
  const user = auth.currentUser;
  if (!user) return;
  await saveUser(user.uid, { online, lastSeen: serverTimestamp() }).catch(() => null);
};

export const logout = async () => {
  await updatePresence(false);
  await signOut(auth);
  localStorage.removeItem('scoutme_profile_uid');
  location.href = '/public/login.html';
};

window.addEventListener('visibilitychange', () => {
  if (!auth.currentUser) return;
  updatePresence(!document.hidden).catch(() => null);
});
window.addEventListener('beforeunload', () => updatePresence(false));
