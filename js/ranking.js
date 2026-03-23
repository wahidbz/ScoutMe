import { listenAllUsers, listenTalents, syncUserScore } from './database.js';
import { buildScoreRing, calculateScore, COUNTRY_OPTIONS, formatDate, numberFormat, q, SPORTS } from './utils.js';
import { t, applyTranslations } from './i18n.js';

export const initRankingPage = async ({ currentProfile }) => {
  const root = q('#page-root');
  root.innerHTML = `
    <div class="ranking-grid">
      <div class="glass-card">
        <div class="filter-bar" style="margin-bottom:18px;">
          <select id="ranking-sport" class="select"><option value="">${t('ranking.allSports', 'All sports')}</option>${SPORTS.map((sport) => `<option value="${sport}" ${sport === currentProfile?.sport ? 'selected' : ''}>${sport}</option>`).join('')}</select>
          <select id="ranking-country" class="select"><option value="">${t('ranking.allCountries', 'All countries')}</option>${COUNTRY_OPTIONS.filter(Boolean).map((country) => `<option value="${country === 'Global' ? '' : country}">${country}</option>`).join('')}</select>
        </div>
        <div id="ranking-podium" class="podium"></div>
        <div class="table-card" style="margin-top:18px;">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>${t('ranking.player', 'Player')}</th>
                <th>${t('ranking.sport', 'Sport')}</th>
                <th>${t('ranking.country', 'Country')}</th>
                <th>${t('ranking.score', 'Score')}</th>
                <th>${t('ranking.updated', 'Updated')}</th>
              </tr>
            </thead>
            <tbody id="ranking-body"></tbody>
          </table>
        </div>
      </div>
      <div class="glass-card">
        <h3>${t('ranking.formulaTitle', 'Score formula')}</h3>
        <p class="muted">${t('ranking.formulaText', 'Score = skills × 0.4 + activity × 0.2 + reviews × 0.2 + videos × 0.2')}</p>
        <div id="ranking-insight" class="list-card"></div>
      </div>
    </div>
  `;
  applyTranslations(root);

  let users = [];
  let talents = [];
  const filters = { sport: currentProfile?.sport || '', country: '' };

  const render = async () => {
    const combined = users
      .filter((user) => user.role === 'player')
      .map((user) => {
        const talent = talents.find((item) => item.userId === user.uid || item.id === user.uid) || {};
        const computedScore = calculateScore(talent);
        if (Math.abs(Number(user.score || 0) - computedScore) > 0.1) syncUserScore(user.uid).catch(() => null);
        return { ...user, computedScore, talent };
      })
      .filter((user) => !filters.sport || user.sport === filters.sport)
      .filter((user) => !filters.country || user.country === filters.country)
      .sort((a, b) => b.computedScore - a.computedScore);

    q('#ranking-podium').innerHTML = combined.slice(0, 3).map((user, index) => `
      <article class="podium-item ${index === 0 ? 'first' : ''}">
        <div class="avatar" style="margin:0 auto 12px;">${user.username?.slice(0, 2)?.toUpperCase() || 'SM'}</div>
        <h3>${user.username}</h3>
        <p class="muted">${user.sport} · ${user.country || 'Global'}</p>
        ${buildScoreRing(user.computedScore, t('ranking.score', 'Score'))}
      </article>
    `).join('') || `<div class="muted">${t('ranking.empty', 'No ranking data yet.')}</div>`;

    q('#ranking-body').innerHTML = combined.map((user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><a href="profile.html?uid=${user.uid}">${user.username}</a></td>
        <td>${user.sport}</td>
        <td>${user.country || 'Global'}</td>
        <td>${user.computedScore.toFixed(1)}</td>
        <td>${formatDate(user.updatedAt || user.createdAt)}</td>
      </tr>
    `).join('') || `<tr><td colspan="6">${t('ranking.empty', 'No ranking data yet.')}</td></tr>`;

    const top = combined[0];
    q('#ranking-insight').innerHTML = top ? `
      <div class="player-card">
        <span class="badge">${t('ranking.currentLeader', 'Current leader')}</span>
        <h3>${top.username}</h3>
        <p class="muted">${top.sport} · ${top.country || 'Global'}</p>
        <strong>${numberFormat(top.talent.views || 0)} ${t('dashboard.views', 'views')}</strong>
      </div>
    ` : `<p class="muted">${t('ranking.empty', 'No ranking data yet.')}</p>`;
  };

  q('#ranking-sport').addEventListener('change', (e) => { filters.sport = e.target.value; render(); });
  q('#ranking-country').addEventListener('change', (e) => { filters.country = e.target.value; render(); });

  listenAllUsers((payload) => { users = payload; render(); });
  listenTalents((payload) => { talents = payload; render(); });
};
