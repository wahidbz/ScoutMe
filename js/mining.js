window.Mining = (() => {
  function rewardFormula(user) {
    return `1 SMTK + activity multiplier (${(((user.stats || {}).activity || 0) / 100).toFixed(2)}) + scout level (${user.scoutLevel || 1}) + streak (${user.streak || 0}) + AI trust (${user.trustScore || 0})`;
  }

  async function mount(rootId, user) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const session = await DB.getMiningSession(user.uid);
    const start = session?.startedAt ? Utils.toDate(session.startedAt) : null;
    const now = Date.now();
    const duration = 24 * 60 * 60 * 1000;
    const elapsed = start ? now - start.getTime() : 0;
    const remaining = Math.max(0, duration - elapsed);
    const canClaim = session?.active && remaining === 0;
    const progress = Math.min(100, (elapsed / duration) * 100);

    root.innerHTML = `
      <div class="grid-2">
        <section class="glass panel">
          <div class="row-between mb-3"><h3 class="panel-title" data-i18n="mining.title">⛏️ SMTK Mining Core</h3><span class="badge ${session?.active ? 'gold' : 'dark'}" data-i18n="mining.${session?.active ? 'active' : 'idle'}">${session?.active ? 'Active' : 'Idle'}</span></div>
          <div class="mining-visual mt-3 center">
            <div class="score-ring lg" style="--score:${progress / 100}"><strong>${Math.floor(progress)}%</strong></div>
            <div class="countdown-label mt-2" id="mining-countdown" data-i18n="${remaining > 0 ? '' : 'mining.ready'}">${remaining > 0 ? formatTime(remaining) : 'Ready to claim'}</div>
          </div>
          <div class="metric-grid mt-4">
            <div class="metric-card"><div class="label" data-i18n="dashboard.total_smtk">SMTK Balance</div><div class="value">${Number((user.balances || {}).smtk || 0).toFixed(2)}</div></div>
            <div class="metric-card"><div class="label" data-i18n="mining.speed">Multiplier</div><div class="value">x${(user.scoutLevel || 1) + (user.streak || 0) * 0.1}</div></div>
          </div>
          <div class="page-actions mt-4">
            ${!session?.active ? `<button class="btn btn-primary btn-block" id="mining-start-btn" data-i18n="mining.start">Initialize 24h Session</button>` : ''}
            ${session?.active ? `<button class="btn btn-success btn-block" id="mining-claim-btn" ${canClaim ? '' : 'disabled'} data-i18n="${canClaim ? 'mining.claim' : ''}">${canClaim ? 'Claim Rewards' : 'Mining in progress...'}</button>` : ''}
          </div>
          <div class="notice info mt-4">${rewardFormula(user)}</div>
        </section>
        <section class="glass panel">
          <h3 class="panel-title" data-i18n="mining.status">🛡️ Protocol Status</h3>
          <div class="timeline">
            <div class="timeline-item"><strong>Session Token</strong><div class="small text-muted mt-1">${session?.sessionToken || '---'}</div></div>
            <div class="timeline-item"><strong data-i18n="ecosystem.mission">Streak Bonus</strong><div class="small text-muted mt-1">${user.streak || 0} days active</div></div>
            <div class="timeline-item"><strong>Last Sync</strong><div class="small text-muted mt-1">${session?.lastClaim ? Utils.timeAgo(session.lastClaim) : 'Never'}</div></div>
          </div>
        </section>
      </div>
    `;

    if (remaining > 0 && session?.active) {
      let currentRem = remaining;
      const interval = setInterval(() => {
        currentRem -= 1000;
        const el = document.getElementById('mining-countdown');
        if (el) el.textContent = formatTime(currentRem);
        if (currentRem <= 0) {
          clearInterval(interval);
          location.reload();
        }
      }, 1000);
    }

    function formatTime(ms) {
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      return `${h}h ${m}m ${s}s remaining`;
    }

    document.getElementById('mining-start-btn')?.addEventListener('click', async () => {
      Utils.showLoader("Activating protocol…");
      try {
        await DB.startMining(user.uid, user);
        Utils.toast('success', 'Mining activated', 'Protocol sync successful.');
        location.reload();
      } catch (error) {
        Utils.toast('error', 'Activation failed', error.message);
      } finally { Utils.hideLoader(); }
    });

    document.getElementById('mining-claim-btn')?.addEventListener('click', async () => {
      if (!canClaim) return;
      Utils.showLoader("Processing claim…");
      try {
        const reward = await DB.claimMining(user.uid, user);
        Utils.toast('success', 'Claim Success', `+${reward} SMTK processed.`);
        location.reload();
      } catch (error) {
        Utils.toast('error', 'Claim failed', error.message);
      } finally { Utils.hideLoader(); }
    });

    if (window.I18n) I18n.translateDOM(root);
  }

  return { mount, rewardFormula };
})();
