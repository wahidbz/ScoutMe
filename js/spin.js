window.Spin = (() => {
  const REWARDS = [
    { key: 'loss', label: 'Try Again', description: 'No luck this time. Keep scouting!', xp: 2, smtk: 0, rarity: 'common' },
    { key: 'smtk_5', label: '5 SMTK Win', description: 'Instant SMTK credit to your wallet.', xp: 10, smtk: 5, rarity: 'rare' },
    { key: 'boost', label: 'Profile Boost', description: '24h spotlight for higher visibility.', xp: 15, smtk: 0, rarity: 'rare' },
    { key: 'golden', label: 'Golden Discovery', description: 'Elite badge and 10 SMTK bonus.', xp: 50, smtk: 10, rarity: 'legendary' }
  ];

  function pickReward() {
    const roll = Math.random();
    if (roll < 0.60) return REWARDS[0]; // 60% Loss
    if (roll < 0.90) return REWARDS[1]; // 30% Win (5 SMTK)
    if (roll < 0.98) return REWARDS[2]; // 8% Boost
    return REWARDS[3]; // 2% Legendary
  }

  async function mount(rootId, user) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const latest = await DB.getLatestSpin(user.uid);
    const lastSpinAt = Utils.toDate(latest?.lastSpinAt)?.getTime() || 0;
    const freeSpinReady = !lastSpinAt || (Date.now() - lastSpinAt) >= 20 * 60 * 60 * 1000;
    const extraSpins = Number((user.bonuses || {}).extraSpins || 0);

    root.innerHTML = `
      <div class="grid-2">
        <section class="glass panel center">
          <h3 class="panel-title" data-i18n="spin.title">🎯 Daily scout spin</h3>
          <div class="score-ring" style="--score:0.78;margin:0 auto 20px"><strong>SPIN</strong></div>
          <div class="small text-muted" data-i18n="spin.desc">One free spin every day. Extra spins are unlocked by activity, missions, and referrals.</div>
          <div class="page-actions mt-3" style="justify-content:center">
            <button class="btn btn-primary" id="spin-free-btn" ${freeSpinReady ? '' : 'disabled'} data-i18n="spin.free">Free spin</button>
            <button class="btn btn-secondary" id="spin-extra-btn" ${extraSpins > 0 ? '' : 'disabled'} data-i18n="spin.extra">Use extra spin (${extraSpins})</button>
          </div>
          ${latest ? `<div class="notice success mt-3"><span data-i18n="spin.history">Last reward</span>: <strong>${latest.reward?.label || 'Unknown'}</strong> · ${Utils.formatDate(latest.lastSpinAt)}</div>` : ''}
        </section>
        <section class="glass panel">
          <h3 class="panel-title" data-i18n="spin.reward_table">🎁 Reward table</h3>
          <div class="card-list">
            ${REWARDS.map((reward) => `<div class="spin-card"><div class="row-between"><strong>${reward.label}</strong><span class="badge ${reward.rarity === 'legendary' ? 'gold' : reward.rarity === 'rare' ? 'green' : 'dark'}">${reward.rarity}</span></div><div class="small text-muted mt-1">${reward.description}</div></div>`).join('')}
          </div>
        </section>
      </div>
    `;

    async function handleSpin(useExtraSpin) {
      try {
        const reward = { ...pickReward(), usedExtraSpin: !!useExtraSpin };
        await DB.saveSpin(user.uid, reward, user);
        if (reward.key === 'badge') {
          await DB.updateUser(user.uid, { badges: ScoutMeFirebase.arrayUnion('Pro') });
        }
        if (reward.key === 'boost') {
          await DB.updateUser(user.uid, { boosted: true, boostUntil: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() });
        }
        if (reward.key === 'golden') {
          await DB.updateUser(user.uid, { badges: ScoutMeFirebase.arrayUnion('Golden Talent'), bonuses: { extraSpins: 1 } });
        }
        await DB.logActivity(user.uid, 3);
        Utils.toast('success', 'Spin complete', `You won: ${reward.label}`);
        location.reload();
      } catch (error) {
        Utils.toast('error', 'Spin failed', error.message || 'Unable to save the reward.');
      }
    }

    document.getElementById('spin-free-btn').addEventListener('click', () => handleSpin(false));
    document.getElementById('spin-extra-btn').addEventListener('click', () => handleSpin(true));

    if (window.I18n) I18n.translateDOM(root);
  }

  return { mount, REWARDS };
})();
