window.ScoutAI = (() => {
  function scorePotential(user = {}, talent = {}) {
    const stats = talent.stats || {};
    const profile = user.profileStats || {};
    const base = (
      (Number(stats.speed || profile.speed || 60) * 0.22) +
      (Number(stats.technique || profile.technique || 60) * 0.24) +
      (Number(stats.tactical || profile.tactical || 55) * 0.18) +
      (Number(stats.consistency || profile.consistency || 50) * 0.18) +
      (Number(user.scoutLevel || 1) * 2.4) +
      (Number(user.streak || 0) * 0.65)
    );
    // Potential adjustment based on activity density
    const density = (user.stats?.activity || 0) / Math.max(1, user.scoutLevel || 1);
    const potentialBonus = density > 10 ? 5 : 0;
    
    return Math.round(Utils.clamp(base + potentialBonus, 1, 99));
  }

  function trustScore(user = {}, meta = {}) {
    const suspiciousFlags = [];
    let score = 68;
    if ((user.streak || 0) >= 7) score += 8;
    if ((user.reviewCount || 0) >= 3) score += 6;
    if ((user.stats && user.stats.videos || 0) >= 2) score += 4;
    if ((user.stats && user.stats.activity || 0) > 40) score += 6;
    if ((meta.sessionBurst || 0) > 8) {
      score -= 16;
      suspiciousFlags.push("burst-activity");
    }
    if ((meta.repeatPattern || 0) > 3) {
      score -= 12;
      suspiciousFlags.push("repeat-pattern");
    }
    if ((meta.deviceMismatch || 0) > 1) {
      score -= 8;
      suspiciousFlags.push("device-mismatch");
    }
    return {
      score: Utils.clamp(Math.round(score), 1, 100),
      suspiciousFlags,
      status: suspiciousFlags.length ? "review" : "healthy"
    };
  }

  function detectTrending(users = []) {
    return users
      .map((user) => ({
        ...user,
        trendScore: Math.round(((user.score || 0) * 0.55) + (((user.stats || {}).activity || 0) * 0.2) + (((user.stats || {}).views || 0) * 0.1) + ((user.scoutLevel || 1) * 5))
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 5);
  }

  function recommendations(currentUser = {}, leaderboard = []) {
    const sameSport = leaderboard.filter((item) => item.sport === currentUser.sport && item.uid !== currentUser.uid);
    const highTrust = sameSport.filter((item) => (item.trustScore || 0) >= 75).slice(0, 4);
    return highTrust.map((item) => ({
      uid: item.uid,
      username: item.username,
      reason: item.role === "club" ? "High-trust club match" : "Trending talent in your sport",
      score: item.score || 0,
      sport: item.sport
    }));
  }

  function missionBoost(user = {}) {
    return Math.round(((user.scoutLevel || 1) * 0.75) + ((user.streak || 0) * 0.35) + (((user.stats || {}).activity || 0) * 0.08));
  }

  return {
    scorePotential,
    trustScore,
    detectTrending,
    recommendations,
    missionBoost
  };
})();
