window.Auth = (() => {
  async function ensureFirebaseAuth() {
    const auth = ScoutMeFirebase.getAuth();
    if (auth.currentUser) return auth.currentUser;
    const result = await auth.signInAnonymously();
    return result.user;
  }

  async function loginWithPi() {
    if (!ScoutMeFirebase.requirePiBrowser()) {
      Utils.toast("warning", "Pi Browser required", "Open ScoutMe inside Pi Browser to continue.");
      return null;
    }

    Utils.showLoader(I18n.t("login.connecting"));
    try {
      const piUser = await Pi.authenticate(["username", "payments"], (payment) => {
        // Required for Pi SDK compliance
        console.warn("Incomplete payment found", payment);
        // In a real app, you would hit your complete/cancel endpoints here
      });

      const fbUser = await ensureFirebaseAuth();
      const piUsername = piUser.user?.username || piUser.username || "PiUser";
      const piUid = piUser.user?.uid || piUser.uid;
      const accessToken = piUser.accessToken;

      Utils.setSession({ uid: fbUser.uid, piUsername, authProvider: "pi", accessToken });

      const existing = await DB.getUser(fbUser.uid);
      await DB.createOrMergeUser(fbUser.uid, {
        uid: fbUser.uid,
        piUid: piUid || fbUser.uid,
        username: piUsername,
        authProvider: "pi",
        lastPiLoginAt: new Date().toISOString(),
        autoLogin: true
      });

      Utils.hideLoader();
      return { firebaseUser: fbUser, piUser, existingProfile: existing };
    } catch (error) {
      Utils.hideLoader();
      Utils.toast("error", "Pi login failed", error.message || "Please try again.");
      throw error;
    }
  }

  async function completeOnboarding(profile) {
    const current = await requireAuth(false);
    if (!current) throw new Error("No active Firebase user.");

    const role = profile.role || "player";
    const sport = profile.sport || "football";
    const username = profile.username?.trim() || Utils.getSession()?.piUsername || "ScoutMe User";

    const baseStats = {
      football: { speed: 72, technique: 71, tactical: 69, consistency: 70 },
      basketball: { speed: 70, technique: 74, tactical: 68, consistency: 69 },
      tennis: { speed: 68, technique: 76, tactical: 67, consistency: 72 },
      boxing: { speed: 71, technique: 73, tactical: 64, consistency: 71 },
      athletics: { speed: 82, technique: 61, tactical: 58, consistency: 70 }
    };

    const userPayload = {
      uid: current.uid,
      username,
      role,
      sport,
      language: profile.language || Utils.getLocale() || "en",
      wallet: profile.wallet || "",
      country: profile.country || "Global",
      createdAt: new Date().toISOString(),
      scoutLevel: 1,
      streak: 1,
      scoutLevelXp: 0,
      trustScore: 72,
      trustStatus: "healthy",
      reviewRating: 4.2,
      aiPotential: 74,
      badges: ["Verified"],
      balances: { smtk: 0 },
      stats: { views: 0, activity: 8, likes: 0, videos: 0 },
      bonuses: { extraSpins: 0 },
      season: "2026",
      profileStats: baseStats[sport] || baseStats.football,
      referralCode: Utils.slug(username) + current.uid.slice(-4),
      online: true,
      autoLogin: true,
      bio: profile.bio || "Driven by discipline, data, and daily missions.",
      sportRole: profile.position || profile.speciality || "Prospect"
    };

    await DB.createOrMergeUser(current.uid, userPayload);
    await DB.createOrMergeTalent(current.uid, {
      uid: current.uid,
      sport,
      positions: [profile.position || "Prospect"],
      roleType: App.isTeamSport(sport) ? "team" : "individual",
      stats: userPayload.profileStats,
      highlightLinks: profile.highlight ? [profile.highlight] : [],
      achievements: [],
      smartTags: [sport, role, "scoutme"]
    });
    await DB.refreshDerivedUser(current.uid);
    Utils.markOnboardingDone();
    return DB.getUser(current.uid);
  }

  async function requireAuth(redirect = true) {
    try {
      const user = await ensureFirebaseAuth();
      if (!user && redirect) {
        location.href = "/login.html";
        return null;
      }
      return user;
    } catch (_) {
      if (redirect) location.href = "/login.html";
      return null;
    }
  }

  async function getProfile() {
    const authUser = await requireAuth(false);
    if (!authUser) return null;
    return DB.getUser(authUser.uid);
  }

  async function logout() {
    try {
      const profile = await getProfile();
      if (profile?.uid) await DB.updatePresence(profile.uid, false);
    } catch (_) {}
    Utils.clearSession();
    await ScoutMeFirebase.getAuth().signOut();
    location.href = "/login.html";
  }

  return {
    loginWithPi,
    completeOnboarding,
    requireAuth,
    getProfile,
    logout
  };
})();
