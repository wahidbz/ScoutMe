window.Missions = (() => {
  const DAILY_MISSIONS = [
    { id: 'mission_profile', icon: '👤', title: 'Update your profile', description: 'Improve dynamic sport stats or bio.', reward: '+8 XP' },
    { id: 'mission_scout', icon: '🔭', title: 'Scout 3 talents', description: 'Open ranking and review three player cards.', reward: '+1 extra spin chance' },
    { id: 'mission_video', icon: '🎬', title: 'Add a highlight video', description: 'Attach one YouTube or TikTok clip.', reward: '+10 XP' },
    { id: 'mission_chat', icon: '💬', title: 'Start a conversation', description: 'Message a club, scout, or talent.', reward: '+5 activity' }
  ];

  async function mount(rootId, user) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const completed = user.missions?.completed || [];

    root.innerHTML = `
      <div class="grid-2">
        <section class="glass panel">
          <div class="row-between mb-2">
            <h3 class="panel-title" data-i18n="missions.title">✅ Daily mission loop</h3>
            <span class="badge gold">Streak ${user.streak || 0}</span>
          </div>
          <div class="card-list" id="mission-list">
            ${DAILY_MISSIONS.map((mission) => `
              <div class="mission-card">
                <div class="row-between">
                  <div><strong>${mission.icon} <span data-i18n="${mission.id}">${mission.title}</span></strong><div class="small text-muted mt-1" data-i18n="${mission.id}_desc">${mission.description}</div></div>
                  <button class="btn ${completed.includes(mission.id) ? 'btn-success' : 'btn-secondary'} btn-sm" data-mission="${mission.id}" ${completed.includes(mission.id) ? 'disabled' : ''}><span data-i18n="${completed.includes(mission.id) ? 'missions.done' : 'missions.complete'}">${completed.includes(mission.id) ? 'Done' : 'Complete'}</span></button>
                </div>
                <div class="small text-muted mt-2"><span data-i18n="missions.reward">Reward:</span> ${mission.reward}</div>
              </div>
            `).join('')}
          </div>
        </section>
        <section class="glass panel">
          <h3 class="panel-title" data-i18n="missions.feedback">🔥 Dopamine feedback loop</h3>
          <div class="timeline">
            <div class="timeline-item"><strong>Login</strong><div class="small text-muted mt-1">Auto-login with Pi + Firebase session.</div></div>
            <div class="timeline-item"><strong>Daily mission</strong><div class="small text-muted mt-1">Complete tasks for XP, activity, and spin credits.</div></div>
            <div class="timeline-item"><strong>Mining</strong><div class="small text-muted mt-1">Activate 24h SMTK mining and claim tomorrow.</div></div>
            <div class="timeline-item"><strong>Reward + spin</strong><div class="small text-muted mt-1">Random rewards feed ranking progress and retention.</div></div>
          </div>
        </section>
      </div>
    `;

    document.querySelectorAll('[data-mission]').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.mission;
        const nextCompleted = [...new Set([...(user.missions?.completed || []), id])];
        const updates = { ...(user.missions || {}), completed: nextCompleted, completedToday: nextCompleted.length };
        try {
          await DB.pushMissionProgress(user.uid, updates);
          if (id === 'mission_scout') {
            await DB.updateUser(user.uid, { bonuses: { extraSpins: Number((user.bonuses || {}).extraSpins || 0) + 1 } });
          }
          Utils.toast('success', 'Mission completed', 'Your scout loop has progressed.');
          location.reload();
        } catch (error) {
          Utils.toast('error', 'Mission failed', error.message || 'Could not update mission progress.');
        }
      });
    });
  }

  return { DAILY_MISSIONS, mount };
})();
