import { loadLanguage, setupLanguageSwitcher, t, applyTranslations, getCurrentLanguage } from './i18n.js';
import { ensureFirebaseSession, loginWithPi, logout, requireProfile, updatePresence } from './auth.js';
import { auth } from './firebase.js';
import {
  getTalent,
  getUser,
  incrementTalentMetric,
  listenAllUsers,
  listenHall,
  listenNotifications,
  listenTalents,
  saveTalent,
  saveUser,
  syncUserScore
} from './database.js';

import { initRankingPage } from './ranking.js';
import { initTransferPage } from './transfer.js';
import { initChatPage } from './chat.js';
import { initMetaversePage } from './metaverse.js';
import { createPiFeaturePayment } from './payment.js';

import {
  COUNTRY_OPTIONS,
  PAYMENT_CATALOG,
  SPORTS,
  computeRecommendations,
  formatDate,
  getInitials,
  getTikTokEmbed,
  getYouTubeEmbed,
  numberFormat,
  profileBadge,
  q,
  qa,
  renderPositionOptions,
  setActiveSidebar,
  simpleLineBars,
  toast,
  calculateScore
} from './utils.js';

/* ---------------- PAGE COPY ---------------- */

const pageCopy = {
  dashboard: { title: 'dashboard.title', subtitle: 'dashboard.subtitle' },
  profile: { title: 'profile.title', subtitle: 'profile.subtitle' },
  ranking: { title: 'ranking.title', subtitle: 'ranking.subtitle' },
  transfer: { title: 'transfer.title', subtitle: 'transfer.subtitle' },
  hall: { title: 'hall.title', subtitle: 'hall.subtitle' },
  chat: { title: 'chat.title', subtitle: 'chat.subtitle' },
  metaverse: { title: 'metaverse.title', subtitle: 'metaverse.subtitleLong' }
};

const setPageHeader = (page) => {
  if (!pageCopy[page]) return;

  const titleNode = q('#page-title');
  const descNode = q('#page-description');

  if (titleNode) titleNode.textContent = t(pageCopy[page].title, titleNode.textContent);
  if (descNode) descNode.textContent = t(pageCopy[page].subtitle, descNode.textContent);
};

/* ---------------- LANGUAGE ---------------- */

const setupGlobalLanguage = async (currentProfile = null) => {
  const select = q('#global-language');
  if (!select) return;

  setupLanguageSwitcher(select, async (lang) => {
    if (currentProfile?.uid) await saveUser(currentProfile.uid, { language: lang });
    setPageHeader(document.body.dataset.page);
  });

  if (currentProfile?.language && currentProfile.language !== getCurrentLanguage()) {
    await loadLanguage(currentProfile.language);
  }
};

/* ---------------- LANDING ---------------- */

const renderLanding = () => {
  const year = q('#year');
  if (year) year.textContent = String(new Date().getFullYear());
};

/* ---------------- LOGIN ---------------- */

const renderLogin = async () => {
  const button = q('#pi-login-btn');
  const statusNode = q('#login-status-text');

  button?.addEventListener('click', async () => {
    try {
      statusNode.textContent = t('auth.progressPi', 'Authorizing...');
      const profile = await loginWithPi();
      statusNode.textContent = `Connected as @${profile.username}`;
      location.href = 'profile.html?onboarding=1';
    } catch (error) {
      statusNode.textContent = error.message;
    }
  });
};

/* ---------------- DASHBOARD ---------------- */

const dashboardTemplate = (profile, talent) => `
<div class="dashboard-grid">
  <section class="glass-card span-12">
    <div class="stats-grid">
      <article class="stat-card"><span class="muted">Views</span><strong>${numberFormat(talent.views || 0)}</strong></article>
      <article class="stat-card"><span class="muted">Score</span><strong>${Number(profile.score || 0).toFixed(1)}</strong></article>
      <article class="stat-card"><span class="muted">Activity</span><strong>${numberFormat(talent.stats?.activity || 0)}</strong></article>
      <article class="stat-card"><span class="muted">Badge</span><strong>${profileBadge(profile)}</strong></article>
    </div>
  </section>
</div>
`;

const initDashboard = async (currentProfile) => {
  const talent = await getTalent(currentProfile.uid);
  const root = q('#page-root');

  root.innerHTML = dashboardTemplate(currentProfile, talent);
  applyTranslations(root);

  q('#boost-profile-btn')?.addEventListener('click', () =>
    createPiFeaturePayment('boost', { sport: currentProfile.sport })
  );

  listenNotifications(currentProfile.uid, (items) => {
    q('#dashboard-notifications').innerHTML =
      items.map(i => `<div>${i.message}</div>`).join('');
  });

  let users = [];
  let talents = [];

  const render = () => {
    const recs = computeRecommendations(users, currentProfile);
    q('#dashboard-recommendations').innerHTML =
      recs.map(u => `<div>${u.username}</div>`).join('');
  };

  listenAllUsers((u) => { users = u; render(); });
  listenTalents((t) => { talents = t; render(); });
};

/* ---------------- PROFILE ---------------- */

const initProfile = async (currentProfile) => {
  const root = q('#page-root');
  root.innerHTML = `<div>Profile Page</div>`;
};

/* ---------------- HALL ---------------- */

const initHall = async (currentProfile) => {
  const root = q('#page-root');
  root.innerHTML = `<div>Hall Page</div>`;
};

/* ---------------- PROTECTED ---------------- */

const initProtectedPage = async () => {
  const currentProfile = await requireProfile();
  if (!currentProfile) return;

  const page = document.body.dataset.page;

  await setupGlobalLanguage(currentProfile);
  setActiveSidebar(page);
  setPageHeader(page);
  await updatePresence(true);

  if (page === 'dashboard') return initDashboard(currentProfile);
  if (page === 'profile') return initProfile(currentProfile);
  if (page === 'ranking') return initRankingPage({ currentProfile });
  if (page === 'transfer') return initTransferPage({ currentProfile });
  if (page === 'chat') return initChatPage({ currentProfile });
  if (page === 'hall') return initHall(currentProfile);
  if (page === 'metaverse') return initMetaversePage({ currentProfile });
};

/* ---------------- BOOT ---------------- */

const boot = async () => {
  const lang = localStorage.getItem('scoutme_language') || 'en';
  await loadLanguage(lang);

  const select = document.getElementById('global-language');
  if (select) {
    setupLanguageSwitcher(select, async (l) => {
      await loadLanguage(l);
      applyTranslations(document);
    });
  }

  applyTranslations(document);

  const page = document.body.dataset.page;

  if (page === 'landing') return renderLanding();

  if (page === 'login') {
    await ensureFirebaseSession().catch(() => null);

    if (auth.currentUser) {
      const u = await getUser(auth.currentUser.uid).catch(() => null);
      if (u) return (location.href = 'dashboard.html');
    }

    return renderLogin();
  }

  return initProtectedPage();
};

window.addEventListener('DOMContentLoaded', boot);