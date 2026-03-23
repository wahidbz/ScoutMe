import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  increment,
  query,
  orderBy,
  limit,
  writeBatch
} from './firebase.js';
import { DEFAULT_TALENT, calculateScore, slugConversation } from './utils.js';

export const refs = {
  users: collection(db, 'users'),
  talents: collection(db, 'talents'),
  transfers: collection(db, 'transfers'),
  messages: collection(db, 'messages'),
  hall: collection(db, 'hall_of_fame'),
  notifications: collection(db, 'notifications'),
  payments: collection(db, 'payments'),
  typing: collection(db, 'typing')
};

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const saveUser = async (uid, payload) => setDoc(doc(db, 'users', uid), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
export const saveTalent = async (uid, payload) => {
  const talent = { ...DEFAULT_TALENT, ...payload };
  talent.stats = { ...DEFAULT_TALENT.stats, ...(payload.stats || {}) };
  talent.userId = uid;
  talent.updatedAt = serverTimestamp();
  await setDoc(doc(db, 'talents', uid), talent, { merge: true });
  return talent;
};

export const getTalent = async (uid) => {
  const snap = await getDoc(doc(db, 'talents', uid));
  return snap.exists() ? snap.data() : DEFAULT_TALENT;
};

export const createNotification = async (payload) => addDoc(refs.notifications, { read: false, createdAt: serverTimestamp(), ...payload });

export const createTransfer = async (payload) => {
  const ref = await addDoc(refs.transfers, {
    ...payload,
    status: payload.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
};

export const updateTransfer = async (id, payload) => updateDoc(doc(db, 'transfers', id), { ...payload, updatedAt: serverTimestamp() });

export const createHallEntry = async (payload) => addDoc(refs.hall, { ...payload, createdAt: serverTimestamp(), date: payload.date || serverTimestamp() });

export const savePayment = async (id, payload) => setDoc(doc(db, 'payments', id), { ...payload, updatedAt: serverTimestamp() }, { merge: true });

export const sendMessage = async ({ senderId, receiverId, text }) => {
  const conversationId = slugConversation(senderId, receiverId);
  return addDoc(refs.messages, {
    senderId,
    receiverId,
    conversationId,
    text,
    seen: false,
    timestamp: serverTimestamp()
  });
};

export const setTypingState = async (conversationId, uid, state, receiverId = '') => {
  await setDoc(doc(db, 'typing', `${conversationId}_${uid}`), {
    conversationId,
    uid,
    receiverId,
    state,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const markConversationSeen = async (conversationId, receiverId) => {
  const snap = await getDocs(refs.messages);
  const batch = writeBatch(db);
  snap.docs.forEach((item) => {
    const data = item.data();
    if (data.conversationId === conversationId && data.receiverId === receiverId && !data.seen) {
      batch.update(item.ref, { seen: true });
    }
  });
  await batch.commit().catch(() => null);
};

export const listenAllUsers = (callback) => onSnapshot(refs.users, (snap) => callback(snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }))));
export const listenTalents = (callback) => onSnapshot(refs.talents, (snap) => callback(snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }))));
export const listenTransfers = (callback) => onSnapshot(query(refs.transfers, orderBy('createdAt', 'desc')), (snap) => callback(snap.docs.map((item) => ({ id: item.id, ...item.data() }))));
export const listenNotifications = (uid, callback) => onSnapshot(query(refs.notifications, orderBy('createdAt', 'desc'), limit(20)), (snap) => {
  const rows = snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.userId === uid);
  callback(rows);
});
export const listenHall = (callback) => onSnapshot(query(refs.hall, orderBy('date', 'desc'), limit(100)), (snap) => callback(snap.docs.map((item) => ({ id: item.id, ...item.data() }))));
export const listenMessages = (conversationId, callback) => onSnapshot(query(refs.messages, orderBy('timestamp', 'asc')), (snap) => {
  callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.conversationId === conversationId));
});
export const listenTyping = (conversationId, callback) => onSnapshot(refs.typing, (snap) => callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.conversationId === conversationId)));

export const incrementTalentMetric = async (uid, field, amount = 1) => setDoc(doc(db, 'talents', uid), { [field]: increment(amount), updatedAt: serverTimestamp() }, { merge: true });

export const syncUserScore = async (uid) => {
  const talent = await getTalent(uid);
  const score = calculateScore(talent);
  await saveUser(uid, { score });
  return score;
};
