window.DB = (() => {
  const fb = window.ScoutMeFirebase;



  const db = () => fb.getDB();
  const auth = () => fb.getAuth();

  const collections = {
    users: () => db().collection("users"),
    talents: () => db().collection("talents"),
    transfers: () => db().collection("transfers"),
    messages: () => db().collection("messages"),
    conversations: () => db().collection("conversations"),
    hall: () => db().collection("hall_of_fame"),
    notifications: () => db().collection("notifications"),
    mining: () => db().collection("mining_sessions"),
    spin: () => db().collection("spin_rewards")
  };

  async function getUser(uid) {
    const snap = await collections.users().doc(uid).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }

  async function createOrMergeUser(uid, payload) {
    await collections.users().doc(uid).set({
      uid,
      updatedAt: fb.serverTimestamp(),
      ...payload
    }, { merge: true });
    return getUser(uid);
  }

  async function updateUser(uid, payload) {
    await collections.users().doc(uid).set({ ...payload, updatedAt: fb.serverTimestamp() }, { merge: true });
    return getUser(uid);
  }

  function listenUser(uid, callback) {
    return collections.users().doc(uid).onSnapshot((snap) => callback(snap.exists ? { id: snap.id, ...snap.data() } : null));
  }

  async function createOrMergeTalent(uid, payload) {
    await collections.talents().doc(uid).set({ uid, updatedAt: fb.serverTimestamp(), ...payload }, { merge: true });
    return getTalent(uid);
  }

  async function getTalent(uid) {
    const snap = await collections.talents().doc(uid).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }

  function listenTalent(uid, callback) {
    return collections.talents().doc(uid).onSnapshot((snap) => callback(snap.exists ? { id: snap.id, ...snap.data() } : null));
  }

  async function refreshDerivedUser(uid) {
    const [user, talent] = await Promise.all([getUser(uid), getTalent(uid)]);
    if (!user) return null;

    const profileStats = talent?.stats || user.profileStats || {};
    const activity = Utils.clamp(Number((user.stats || {}).activity || 0), 0, 100);
    const reviews = Utils.clamp(Number(user.reviewRating || 0) * 20, 0, 100);
    const videos = Utils.clamp(Number((user.stats || {}).videos || 0) * 20, 0, 100);
    const skills = Math.round(Object.values(profileStats).reduce((sum, value) => sum + Number(value || 0), 0) / Math.max(Object.values(profileStats).length, 1));
    const score = Utils.computeScore({ skills, activity, reviews, videos });
    const trust = ScoutAI.trustScore(user, { sessionBurst: (user.flags || {}).sessionBurst || 0, repeatPattern: (user.flags || {}).repeatPattern || 0, deviceMismatch: (user.flags || {}).deviceMismatch || 0 });
    const aiPotential = ScoutAI.scorePotential(user, talent || {});

    await updateUser(uid, {
      score,
      trustScore: trust.score,
      trustStatus: trust.status,
      suspiciousFlags: trust.suspiciousFlags,
      aiPotential,
      profileStats,
      scoreBreakdown: { skills, activity, reviews, videos },
      lastCalculatedAt: new Date().toISOString()
    });
    return getUser(uid);
  }

  async function logActivity(uid, delta = 1) {
    await collections.users().doc(uid).set({
      stats: { activity: fb.increment(delta) },
      lastActiveAt: fb.serverTimestamp()
    }, { merge: true });
    return refreshDerivedUser(uid);
  }

  async function addNotification(uid, payload) {
    return collections.notifications().add({
      uid,
      read: false,
      createdAt: fb.serverTimestamp(),
      ...payload
    });
  }

  function listenNotifications(uid, callback) {
    return collections.notifications()
      .where("uid", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .onSnapshot((snap) => callback(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
  }

  async function markNotificationRead(id) {
    return collections.notifications().doc(id).set({ read: true, updatedAt: fb.serverTimestamp() }, { merge: true });
  }

  async function listUsers(filters = {}) {
    const snap = await collections.users().where("role", "in", filters.roles || ["player", "club", "scout", "agent"]).limit(100).get();
    let rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (filters.sport) rows = rows.filter((row) => row.sport === filters.sport);
    if (filters.country) rows = rows.filter((row) => row.country === filters.country);
    if (filters.role) rows = rows.filter((row) => row.role === filters.role);
    return rows;
  }

  function listenLeaderboard(filters, callback) {
    return collections.users()
      .where("role", "==", "player")
      .orderBy("score", "desc")
      .limit(50)
      .onSnapshot((snap) => {
        let rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (filters?.sport) rows = rows.filter((row) => row.sport === filters.sport);
        if (filters?.country) rows = rows.filter((row) => row.country === filters.country);
        if (filters?.season) rows = rows.filter((row) => (row.season || "2026") === filters.season);
        callback(rows);
      });
  }

  async function createTransfer(payload, actor) {
    const ref = await collections.transfers().add({
      ...payload,
      clubId: actor.uid,
      clubName: actor.username,
      status: "pending",
      createdAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
      contractStatus: "proposal"
    });
    await addNotification(payload.playerId, {
      type: "transfer_offer",
      actorId: actor.uid,
      title: `${actor.username} sent you an offer`,
      message: `${payload.offerValue} ${payload.currency || "PI"} • ${payload.sport}`,
      link: "/transfer.html",
      refId: ref.id
    });
    return ref.id;
  }

  async function updateTransferStatus(transferId, nextStatus, actor) {
    const ref = collections.transfers().doc(transferId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Transfer not found.");
    const transfer = snap.data();

    await ref.set({
      status: nextStatus,
      updatedAt: fb.serverTimestamp(),
      contractStatus: nextStatus === "accepted" ? "contract-ready" : nextStatus === "completed" ? "signed" : transfer.contractStatus
    }, { merge: true });

    if (nextStatus === "accepted") {
      await addNotification(transfer.clubId, {
        type: "transfer_accepted",
        actorId: actor.uid,
        title: `${transfer.playerName} accepted the offer`,
        message: `Move forward to contract tracking`,
        link: "/transfer.html",
        refId: transferId
      });
    }

    if (nextStatus === "completed") {
      await collections.hall().add({
        transferId,
        playerId: transfer.playerId,
        playerName: transfer.playerName,
        clubId: transfer.clubId,
        clubName: transfer.clubName,
        sport: transfer.sport,
        transferValue: transfer.offerValue,
        currency: transfer.currency || "PI",
        country: transfer.country || "Global",
        season: transfer.season || "2026",
        type: "completed_transfer",
        createdAt: fb.serverTimestamp()
      });
      await addNotification(transfer.playerId, {
        type: "hall_of_fame",
        actorId: actor.uid,
        title: "Completed deal added to Hall of Fame",
        message: `${transfer.clubName} x ${transfer.playerName}`,
        link: "/hall.html",
        refId: transferId
      });
    }
    return true;
  }

  function listenTransfers(user, callback) {
    const field = user.role === "club" ? "clubId" : "playerId";
    return collections.transfers()
      .where(field, "==", user.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => callback(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
  }

  function listenHall(callback, filters = {}) {
    return collections.hall().orderBy("createdAt", "desc").limit(40).onSnapshot((snap) => {
      let rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (filters.sport) rows = rows.filter((row) => row.sport === filters.sport);
      if (filters.season) rows = rows.filter((row) => (row.season || "2026") === filters.season);
      callback(rows);
    });
  }

  async function getConversationId(uidA, uidB, details = {}) {
    const members = [uidA, uidB].sort();
    const id = members.join("__");
    await collections.conversations().doc(id).set({
      members,
      memberNames: details.memberNames || [],
      typing: {},
      presence: {},
      lastMessage: details.lastMessage || "",
      lastAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
      unreadMap: details.unreadMap || {}
    }, { merge: true });
    return id;
  }

  function listenConversations(uid, callback) {
    return collections.conversations()
      .where("members", "array-contains", uid)
      .orderBy("lastAt", "desc")
      .onSnapshot((snap) => callback(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
  }

  function listenMessages(conversationId, callback) {
    return collections.messages()
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "asc")
      .onSnapshot((snap) => callback(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
  }

  async function sendMessage(conversationId, sender, receiver, text) {
    await collections.messages().add({
      conversationId,
      senderId: sender.uid,
      senderName: sender.username,
      receiverId: receiver.uid,
      text,
      seenBy: [sender.uid],
      createdAt: fb.serverTimestamp(),
      typingSnapshot: false
    });
    await collections.conversations().doc(conversationId).set({
      lastMessage: text,
      lastAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp(),
      unreadMap: { [receiver.uid]: fb.increment(1) },
      memberNames: [sender.username, receiver.username]
    }, { merge: true });
    await addNotification(receiver.uid, {
      type: "message",
      actorId: sender.uid,
      title: `${sender.username} sent a message`,
      message: text.slice(0, 80),
      link: "/chat.html",
      conversationId
    });
    return logActivity(sender.uid, 2);
  }

  async function setTyping(conversationId, uid, typing) {
    await collections.conversations().doc(conversationId).set({ typing: { [uid]: !!typing }, updatedAt: fb.serverTimestamp() }, { merge: true });
  }

  async function setSeen(conversationId, uid) {
    const snapshot = await collections.messages().where("conversationId", "==", conversationId).where("receiverId", "==", uid).get();
    const batch = db().batch();
    snapshot.docs.forEach((doc) => batch.set(doc.ref, { seenBy: fb.arrayUnion(uid), seenAt: fb.serverTimestamp() }, { merge: true }));
    batch.set(collections.conversations().doc(conversationId), { unreadMap: { [uid]: 0 }, updatedAt: fb.serverTimestamp() }, { merge: true });
    await batch.commit();
  }

  async function updatePresence(uid, online = true) {
    await updateUser(uid, { online, lastSeen: new Date().toISOString() });
  }

  async function getMiningSession(uid) {
    const snap = await collections.mining().doc(uid).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }

  async function startMining(uid, user) {
    const current = await getMiningSession(uid);
    const now = Date.now();
    if (current?.active && current?.startedAt) {
      const start = Utils.toDate(current.startedAt)?.getTime() || 0;
      if (now - start < 24 * 60 * 60 * 1000) return current;
    }
    const rewardBase = 1 + ((user.scoutLevel || 1) * 0.08) + ((user.streak || 0) * 0.03) + (((user.trustScore || 60) - 50) * 0.01);
    await collections.mining().doc(uid).set({
      uid,
      active: true,
      startedAt: new Date().toISOString(),
      lastClaim: current?.lastClaim || null,
      streak: user.streak || 0,
      baseReward: Number(rewardBase.toFixed(2)),
      activityMultiplier: Number((((user.stats || {}).activity || 0) / 100).toFixed(2)),
      sessionToken: Utils.uid("mine"),
      antiFarmScore: Math.max(0, 100 - (user.trustScore || 60)),
      updatedAt: fb.serverTimestamp()
    }, { merge: true });
    await addNotification(uid, {
      type: "mining_started",
      title: "SMTK mining started",
      message: "Come back in 24h to claim your session.",
      link: "/mining.html"
    });
    return getMiningSession(uid);
  }

  async function claimMining(uid, user) {
    const session = await getMiningSession(uid);
    if (!session?.active) throw new Error("No active mining session.");
    const startedAt = Utils.toDate(session.startedAt)?.getTime() || 0;
    if (Date.now() - startedAt < 24 * 60 * 60 * 1000) throw new Error("Mining session is not complete yet.");

    const streakBonus = user.streak >= 30 ? 1 : user.streak >= 7 ? 0.5 : user.streak >= 3 ? 0.2 : 0;
    const reward = Number((1 + (session.activityMultiplier || 0) + ((user.scoutLevel || 1) * 0.12) + ((user.streak || 0) * 0.05) + ((user.trustScore || 60) / 100) + streakBonus).toFixed(2));

    await collections.mining().doc(uid).set({
      active: false,
      lastClaim: new Date().toISOString(),
      lastReward: reward,
      claimedAt: fb.serverTimestamp(),
      updatedAt: fb.serverTimestamp()
    }, { merge: true });
    await updateUser(uid, {
      balances: { smtk: fb.increment(reward) },
      streak: fb.increment(1),
      scoutLevelXp: fb.increment(18),
      stats: { activity: fb.increment(6) }
    });
    await addNotification(uid, {
      type: "mining_claimed",
      title: "SMTK claimed",
      message: `+${reward} SMTK secured from mining.`,
      link: "/mining.html"
    });
    return reward;
  }

  async function getLatestSpin(uid) {
    const snap = await collections.spin().doc(uid).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }

  async function saveSpin(uid, reward, user) {
    const current = await getLatestSpin(uid);
    const extraSpins = Math.max(0, Number((user.bonuses || {}).extraSpins || 0) - (reward.usedExtraSpin ? 1 : 0));
    await collections.spin().doc(uid).set({
      uid,
      reward,
      lastSpinAt: new Date().toISOString(),
      streak: user.streak || 0,
      createdAt: fb.serverTimestamp(),
      antiFarmScore: Math.max(0, 100 - (user.trustScore || 60))
    }, { merge: true });
    await updateUser(uid, {
      bonuses: { extraSpins },
      scoutLevelXp: fb.increment(reward.xp || 6),
      balances: { smtk: fb.increment(reward.smtk || 0) }
    });
    await addNotification(uid, {
      type: "spin_reward",
      title: `Spin reward: ${reward.label}`,
      message: reward.description,
      link: "/spin.html"
    });
    return getLatestSpin(uid);
  }

  async function pushMissionProgress(uid, updates) {
    await updateUser(uid, {
      missions: updates,
      stats: { activity: fb.increment(3) },
      scoutLevelXp: fb.increment(8)
    });
    return refreshDerivedUser(uid);
  }


  return {
    auth,
    getUser,
    createOrMergeUser,
    updateUser,
    listenUser,
    createOrMergeTalent,
    getTalent,
    listenTalent,
    refreshDerivedUser,
    logActivity,
    addNotification,
    listenNotifications,
    markNotificationRead,
    listUsers,
    listenLeaderboard,
    createTransfer,
    updateTransferStatus,
    listenTransfers,
    listenHall,
    getConversationId,
    listenConversations,
    listenMessages,
    sendMessage,
    setTyping,
    setSeen,
    updatePresence,
    getMiningSession,
    startMining,
    claimMining,
    getLatestSpin,
    saveSpin,
    pushMissionProgress
  };
})();
