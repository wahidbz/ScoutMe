window.Ranking = (() => {
  function playerRow(player, index) {
    return `
      <div class="leaderboard-row hover-lift" onclick="location.href='profile.html?uid=${player.uid}'" style="cursor:pointer">
        <div class="rank-badge ${index < 3 ? 'top' : ''}">#${index + 1}</div>
        <div>
          <div style="font-weight:800">${Utils.escapeHTML(player.username)}</div>
          <div class="small text-muted mt-1">${App.sportLabel(player.sport)} • ${Utils.escapeHTML(player.country || 'Global')}</div>
        </div>
        <div class="badge-row">
          <span class="badge dark">Trust ${player.trustScore || 0}</span>
          <span class="badge dark">Potential ${player.aiPotential || 0}</span>
        </div>
        <div><strong>${player.score || 0}</strong><div class="small text-muted">score</div></div>
        <button class="btn btn-secondary btn-sm">View</button>
      </div>
    `;
  }

  function podiumHTML(players = []) {
    const top = [players[1], players[0], players[2]].filter(Boolean);
    const classes = ['second','first','third'];
    return top.map((player, index) => `
      <div class="podium-card ${classes[index]} hover-lift" onclick="location.href='profile.html?uid=${player.uid}'" style="cursor:pointer">
        <div class="avatar lg" style="margin:0 auto 12px">${Utils.initials(player.username)}</div>
        <div style="font-size:.84rem;color:var(--muted)">${index === 1 ? 'Champion' : index === 0 ? 'Runner-up' : 'Third place'}</div>
        <div style="font-weight:900;font-size:1.15rem;margin-top:6px">${Utils.escapeHTML(player.username)}</div>
        <div class="small text-muted mt-1">${App.sportLabel(player.sport)} • ${player.country || 'Global'}</div>
        <div class="badge-row mt-2" style="justify-content:center">
          <span class="badge gold">${player.score || 0} pts</span>
        </div>
        <div class="podium-step"></div>
      </div>
    `).join('');
  }

  function mount(rootId, user) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = `
      <div class="grid-2">
        <section class="glass panel">
          <div class="row-between mb-2">
            <h3 class="panel-title" data-i18n="ranking.podium">🏆 Live podium</h3>
            <div class="filter-row">
              <select class="select" id="ranking-sport" style="min-width:150px"></select>
              <input class="input" id="ranking-country" placeholder="Country filter" data-i18n-placeholder="ranking.country" />
            </div>
          </div>
          <div id="ranking-podium" class="podium"></div>
        </section>
        <section class="glass panel">
          <h3 class="panel-title" data-i18n="ranking.logic">📈 Seasonal ranking logic</h3>
          <div class="notice info">score = skills*0.4 + activity*0.2 + reviews*0.2 + videos*0.2</div>
          <div class="timeline mt-3">
            <div class="timeline-item"><strong>Skills</strong><div class="small text-muted mt-1">Dynamic sport-specific stat average.</div></div>
            <div class="timeline-item"><strong>Activity</strong><div class="small text-muted mt-1">Daily mission completion, mining, scouting interactions.</div></div>
            <div class="timeline-item"><strong>Reviews</strong><div class="small text-muted mt-1">Social proof and verified club feedback.</div></div>
            <div class="timeline-item"><strong>Videos</strong><div class="small text-muted mt-1">YouTube / TikTok highlights.</div></div>
          </div>
        </section>
      </div>
      <section class="glass panel mt-3">
        <div class="row-between mb-2">
          <h3 class="panel-title" data-i18n="ranking.global">🌍 Global leaderboard</h3>
          <div class="chips"><span class="chip gold">Season 2026</span><span class="chip green">Real-time</span></div>
        </div>
        <div id="ranking-list" class="card-list"></div>
      </section>
    `;

    const sportSelect = document.getElementById('ranking-sport');
    sportSelect.innerHTML = `<option value="">All sports</option>${App.SPORTS.map((sport) => `<option value="${sport.key}">${sport.label}</option>`).join('')}`;
    sportSelect.value = user?.sport || '';

    const state = { sport: sportSelect.value, country: '' };
    let unsubscribe = null;

    function subscribe() {
      unsubscribe?.();
      unsubscribe = DB.listenLeaderboard({ sport: state.sport }, (players) => {
        let rows = players;
        if (state.country) rows = rows.filter((row) => (row.country || '').toLowerCase().includes(state.country.toLowerCase()));
        document.getElementById('ranking-podium').innerHTML = rows.length ? podiumHTML(rows.slice(0, 3)) : Utils.emptyState('🏁', 'No players yet', 'Complete missions and refresh the leaderboard.');
        document.getElementById('ranking-list').innerHTML = rows.length ? rows.map((player, index) => playerRow(player, index)).join('') : Utils.emptyState('📉', 'Empty ranking', 'Seed data or onboard players to see the leaderboard.');
      });
    }

    sportSelect.addEventListener('change', () => {
      state.sport = sportSelect.value;
      subscribe();
    });
    document.getElementById('ranking-country').addEventListener('input', Utils.debounce((event) => {
      state.country = event.target.value;
      subscribe();
    }, 220));

    subscribe();
    if (window.I18n) setTimeout(() => I18n.translateDOM(root), 150);
  }

  return { mount, podiumHTML, playerRow };
})();
