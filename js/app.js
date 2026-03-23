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
  listenTransfers,
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

const setupGlobalLanguage = async (currentProfile = null) => {
  const select = q('#global-language');
  if (!select) return;
  setupLanguageSwitcher(select, async (lang) => {
    if (currentProfile?.uid) await saveUser(currentProfile.uid, { language: lang });
    setPageHeader(document.body.dataset.page);
  });
  if (currentProfile?.language && currentProfile.language !== getCurrentLanguage()) {
    await loadLanguage(currentProfile.language);
    setupLanguageSwitcher(select, async (lang) => saveUser(currentProfile.uid, { language: lang }));
  }
};

const renderLanding = () => {
  const year = q('#year');
  if (year) year.textContent = String(new Date().getFullYear());
};

const renderLogin = async () => {
  const button = q('#pi-login-btn');
  const statusNode = q('#login-status-text');
  button?.addEventListener('click', async () => {
    try {
      statusNode.textContent = t('auth.progressPi', 'Authorizing with Pi Browser...');
      const profile = await loginWithPi();
      statusNode.textContent = `${t('auth.progressDone', 'Connected as')} @${profile.username}`;
      location.href = 'profile.html?onboarding=1';
    } catch (error) {
      statusNode.textContent = error.message;
    }
  });
};

const dashboardTemplate = (profile, talent) => `
  <div class="dashboard-grid">
    <section class="glass-card span-12">
      <div class="stats-grid">
        <article class="stat-card"><span class="muted">${t('dashboard.views', 'Views')}</span><strong class="stat-value">${numberFormat(talent.views || 0)}</strong></article>
        <article class="stat-card"><span class="muted">${t('dashboard.rankScore', 'Score')}</span><strong class="stat-value">${Number(profile.score || 0).toFixed(1)}</strong></article>
        <article class="stat-card"><span class="muted">${t('dashboard.activity', 'Activity')}</span><strong class="stat-value">${numberFormat(talent.stats?.activity || talent.activity || 0)}</strong></article>
        <article class="stat-card"><span class="muted">${t('dashboard.badge', 'Badge')}</span><strong class="stat-value">${profileBadge(profile)}</strong></article>
      </div>
    </section>
    <section class="glass-card span-7">
      <div class="page-header"><div><h3>${t('dashboard.performance', 'Weekly performance')}</h3><p class="muted">${t('dashboard.performanceText', 'Momentum based on talent, activity, reviews, and media updates.')}</p></div></div>
      ${simpleLineBars([38, 44, 55, 61, 67, 74, Math.min(96, Math.round(profile.score || 50))])}
    </section>
    <aside class="glass-card span-5">
      <h3>${t('dashboard.quickActions', 'Quick actions')}</h3>
      <div class="feed-list">
        <button class="btn" id="boost-profile-btn">${PAYMENT_CATALOG.boost.label} · 1 Pi</button>
        <button class="ghost-btn" id="hall-entry-btn">${PAYMENT_CATALOG.hall_of_fame.label} · 3 Pi</button>
        <a class="ghost-btn" href="transfer.html">${t('dashboard.goTransfers', 'Open transfer board')}</a>
      </div>
    </aside>
    <section class="glass-card span-6">
      <div class="page-header"><div><h3>${t('dashboard.notifications', 'Notifications')}</h3></div></div>
      <div id="dashboard-notifications" class="notifications-list"></div>
    </section>
    <section class="glass-card span-6">
      <div class="page-header"><div><h3>${t('dashboard.recommendations', 'AI recommendations')}</h3></div></div>
      <div id="dashboard-recommendations" class="feed-list"></div>
    </section>
    <section class="glass-card span-12">
      <div class="page-header"><div><h3>${t('dashboard.trending', 'Trending players')}</h3></div></div>
      <div id="dashboard-trending" class="cards-grid"></div>
    </section>
  </div>
`;

const initDashboard = async (currentProfile) => {
  const talent = await getTalent(currentProfile.uid);
  const root = q('#page-root');
  root.innerHTML = dashboardTemplate(currentProfile, talent);
  applyTranslations(root);

  q('#boost-profile-btn')?.addEventListener('click', async () => createPiFeaturePayment('boost', { sport: currentProfile.sport }));
  q('#hall-entry-btn')?.addEventListener('click', async () => createPiFeaturePayment('hall_of_fame', { sport: currentProfile.sport, club: currentProfile.username }));

  listenNotifications(currentProfile.uid, (items) => {
    q('#dashboard-notifications').innerHTML = items.map((item) => `
      <article class="notification-item">
        <strong>${item.type}</strong>
        <p class="muted">${item.message}</p>
      </article>`).join('') || `<div class="muted">${t('dashboard.noNotifications', 'No notifications yet.')}</div>`;
  });

  let userPool = [];
  let talentPool = [];
  const renderPools = () => {
    const recommendations = computeRecommendations(userPool.filter((user) => user.role === 'player' || user.role === 'club'), currentProfile);
    q('#dashboard-recommendations').innerHTML = recommendations.map((user) => `
      <article class="list-item">
        <div class="inline-actions"><span class="avatar">${getInitials(user.username)}</span><div><strong>${user.username}</strong><div class="muted">${user.sport} · ${user.country || 'Global'}</div></div></div>
      </article>`).join('') || `<div class="muted">${t('dashboard.noRecommendations', 'Recommendations will appear after more activity.')}</div>`;

    const trending = userPool.filter((user) => user.role === 'player').map((user) => {
      const talentDoc = talentPool.find((item) => item.userId === user.uid || item.id === user.uid) || {};
      return { ...user, trend: Number(talentDoc.views || 0) + Number(talentDoc.likes || 0) + Number(talentDoc.activity || talentDoc.stats?.activity || 0) };
    }).sort((a, b) => b.trend - a.trend).slice(0, 3);

    q('#dashboard-trending').innerHTML = trending.map((user) => `
      <article class="player-card">
        <span class="badge">${profileBadge(user)}</span>
        <h3>${user.username}</h3>
        <p class="muted">${user.sport} · ${user.position || 'Athlete'}</p>
        <a class="ghost-btn" href="profile.html?uid=${user.uid}">${t('common.viewProfile', 'View profile')}</a>
      </article>`).join('') || `<div class="muted">${t('dashboard.noTrending', 'No trending players yet.')}</div>`;
  };

  listenAllUsers((users) => { userPool = users; renderPools(); });
  listenTalents((talents) => { talentPool = talents; renderPools(); });
};

const renderVideoCards = (videos = []) => videos.map((url) => {
  const yt = getYouTubeEmbed(url);
  if (yt) return `<iframe class="video-frame" src="${yt}" allowfullscreen loading="lazy"></iframe>`;
  const tt = getTikTokEmbed(url);
  if (tt) return `<div class="list-card"><strong>TikTok</strong><a class="ghost-btn" href="${tt}" target="_blank" rel="noreferrer">${tt}</a></div>`;
  return `<div class="list-card"><strong>Video link</strong><a class="ghost-btn" href="${url}" target="_blank" rel="noreferrer">${url}</a></div>`;
}).join('');

const initProfile = async (currentProfile) => {
  const viewingUid = new URLSearchParams(location.search).get('uid') || currentProfile.uid;
  const isSelf = viewingUid === currentProfile.uid;
  const viewedProfile = isSelf ? currentProfile : await getUser(viewingUid);
  const talent = await getTalent(viewingUid);
  const root = q('#page-root');

  if (!viewedProfile) {
    root.innerHTML = `<div class="glass-card"><p>${t('profile.notFound', 'Profile not found.')}</p></div>`;
    return;
  }

  if (!isSelf) {
    await incrementTalentMetric(viewingUid, 'views', 1).catch(() => null);
  }

  if (!isSelf) {
    root.innerHTML = `
      <div class="profile-grid">
        <section class="glass-card">
          <div class="inline-actions"><span class="avatar">${getInitials(viewedProfile.username)}</span><div><h2>${viewedProfile.username}</h2><div class="muted">${viewedProfile.sport} · ${viewedProfile.position || 'Athlete'} · ${viewedProfile.country || 'Global'}</div></div></div>
          <div class="toolbar" style="margin-top:18px;">
            <span class="badge">${profileBadge(viewedProfile)}</span>
            <span class="badge dark">${Number(viewedProfile.score || calculateScore(talent)).toFixed(1)} ${t('ranking.score', 'Score')}</span>
          </div>
          <p class="muted" style="margin-top:18px;">${viewedProfile.bio || t('profile.defaultBio', 'This profile is ready for scouting and direct club outreach.')}</p>
          <div class="stats-grid" style="margin-top:18px;">
            <article class="stat-card"><span class="muted">${t('dashboard.views', 'Views')}</span><strong class="stat-value">${numberFormat(talent.views || 0)}</strong></article>
            <article class="stat-card"><span class="muted">${t('dashboard.activity', 'Activity')}</span><strong class="stat-value">${numberFormat(talent.stats?.activity || 0)}</strong></article>
            <article class="stat-card"><span class="muted">${t('profile.reviews', 'Reviews')}</span><strong class="stat-value">${numberFormat(talent.stats?.reviews || 0)}</strong></article>
            <article class="stat-card"><span class="muted">${t('profile.media', 'Videos')}</span><strong class="stat-value">${numberFormat(talent.videos?.length || 0)}</strong></article>
          </div>
          <div style="margin-top:18px;" class="cards-grid">${renderVideoCards(talent.videos || []) || `<div class="muted">${t('profile.noVideos', 'No videos uploaded yet.')}</div>`}</div>
        </section>
        <aside class="glass-card">
          <h3>${t('profile.contact', 'Contact')}</h3>
          <p class="muted">${t('profile.contactText', 'Unlock direct outreach through Pi payment or continue in real-time chat.')}</p>
          <div class="feed-list">
            <button class="btn" id="unlock-contact-btn">${PAYMENT_CATALOG.unlock_contact.label} · 2 Pi</button>
            <a class="ghost-btn" href="chat.html?uid=${viewingUid}">${t('profile.openChat', 'Open chat')}</a>
          </div>
        </aside>
      </div>
    `;
    q('#unlock-contact-btn')?.addEventListener('click', async () => createPiFeaturePayment('unlock_contact', { targetUserId: viewingUid }));
    return;
  }

  root.innerHTML = `
    <div class="profile-grid">
      <section class="glass-card">
        <form id="profile-form" class="form-grid">
          <div class="form-row"><label>${t('profile.username', 'Username')}</label><input id="profile-username" class="input" value="${viewedProfile.username || ''}" required /></div>
          <div class="form-row"><label>${t('profile.role', 'Role')}</label><select id="profile-role" class="select"><option value="player" ${viewedProfile.role === 'player' ? 'selected' : ''}>Player</option><option value="club" ${viewedProfile.role === 'club' ? 'selected' : ''}>Club</option></select></div>
          <div class="form-row"><label>${t('profile.sport', 'Sport')}</label><select id="profile-sport" class="select">${SPORTS.map((sport) => `<option value="${sport}" ${sport === viewedProfile.sport ? 'selected' : ''}>${sport}</option>`).join('')}</select></div>
          <div class="form-row"><label>${t('profile.position', 'Position')}</label><select id="profile-position" class="select">${renderPositionOptions(viewedProfile.sport || 'Football', viewedProfile.position || '')}</select></div>
          <div class="form-row"><label>${t('profile.country', 'Country')}</label><select id="profile-country" class="select">${COUNTRY_OPTIONS.map((country) => `<option value="${country}" ${country === (viewedProfile.country || 'Global') ? 'selected' : ''}>${country}</option>`).join('')}</select></div>
          <div class="form-row"><label>${t('profile.age', 'Age')}</label><input id="profile-age" type="number" class="input" min="10" max="60" value="${viewedProfile.age || 18}" /></div>
          <div class="form-row" style="grid-column:1/-1;"><label>${t('profile.bio', 'Bio')}</label><textarea id="profile-bio" class="textarea">${viewedProfile.bio || ''}</textarea></div>
          <div class="form-row"><label>${t('profile.skills', 'Skills')}</label><input id="talent-skills" type="number" min="0" max="100" class="input" value="${talent.stats?.skills || 50}" /></div>
          <div class="form-row"><label>${t('profile.activity', 'Activity')}</label><input id="talent-activity" type="number" min="0" max="100" class="input" value="${talent.stats?.activity || 40}" /></div>
          <div class="form-row"><label>${t('profile.reviews', 'Reviews')}</label><input id="talent-reviews" type="number" min="0" max="100" class="input" value="${talent.stats?.reviews || 20}" /></div>
          <div class="form-row"><label>${t('profile.media', 'Videos')}</label><input id="talent-videos-count" type="number" min="0" max="50" class="input" value="${talent.stats?.videos || talent.videos?.length || 1}" /></div>
          <div class="form-row" style="grid-column:1/-1;"><label>${t('profile.videoLinks', 'Video links')}</label><textarea id="profile-videos" class="textarea" placeholder="One YouTube or TikTok URL per line">${(talent.videos || []).join('\n')}</textarea></div>
          <div class="form-row" style="grid-column:1/-1;"><button class="btn btn-green" type="submit">${t('profile.save', 'Save profile')}</button></div>
        </form>
      </section>
      <aside class="glass-card">
        <h3>${t('profile.preview', 'Profile preview')}</h3>
        <div id="profile-preview" class="feed-list"></div>
        <div class="feed-list" style="margin-top:18px;">
          <button id="profile-boost-btn" class="btn">${PAYMENT_CATALOG.boost.label} · 1 Pi</button>
          <button id="profile-hall-btn" class="ghost-btn">${PAYMENT_CATALOG.hall_of_fame.label} · 3 Pi</button>
        </div>
      </aside>
    </div>
  `;

  const profileSport = q('#profile-sport');
  const positionSelect = q('#profile-position');
  const previewNode = q('#profile-preview');
  const videosInput = q('#profile-videos');

  const refreshPreview = () => {
    const profileDraft = {
      username: q('#profile-username').value,
      role: q('#profile-role').value,
      sport: profileSport.value,
      position: positionSelect.value,
      country: q('#profile-country').value,
      age: q('#profile-age').value,
      bio: q('#profile-bio').value
    };
    const talentDraft = {
      stats: {
        skills: Number(q('#talent-skills').value || 0),
        activity: Number(q('#talent-activity').value || 0),
        reviews: Number(q('#talent-reviews').value || 0),
        videos: Number(q('#talent-videos-count').value || 0)
      },
      videos: videosInput.value.split('\n').map((line) => line.trim()).filter(Boolean)
    };
    const score = calculateScore(talentDraft);
    previewNode.innerHTML = `
      <article class="list-item"><strong>${profileDraft.username}</strong><span class="muted">${profileDraft.sport} · ${profileDraft.position}</span></article>
      <article class="list-item"><span class="badge">${profileBadge({ verified: viewedProfile.verified, score })}</span><strong>${score.toFixed(1)} ${t('ranking.score', 'Score')}</strong></article>
      <article class="list-item"><p class="muted">${profileDraft.bio || t('profile.defaultBio', 'This profile is ready for scouting and direct club outreach.')}</p></article>
    `;
  };

  profileSport.addEventListener('change', () => {
    positionSelect.innerHTML = renderPositionOptions(profileSport.value, '');
    refreshPreview();
  });
  qa('#profile-form input, #profile-form textarea, #profile-form select').forEach((field) => field.addEventListener('input', refreshPreview));
  refreshPreview();

  q('#profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const videos = videosInput.value.split('\n').map((line) => line.trim()).filter(Boolean);
    const profilePayload = {
      username: q('#profile-username').value.trim(),
      role: q('#profile-role').value,
      sport: profileSport.value,
      position: positionSelect.value,
      country: q('#profile-country').value,
      age: Number(q('#profile-age').value || 18),
      language: getCurrentLanguage(),
      bio: q('#profile-bio').value.trim(),
      onboardingComplete: true
    };
    const talentPayload = {
      stats: {
        skills: Number(q('#talent-skills').value || 0),
        activity: Number(q('#talent-activity').value || 0),
        reviews: Number(q('#talent-reviews').value || 0),
        videos: Number(q('#talent-videos-count').value || videos.length)
      },
      activity: Number(q('#talent-activity').value || 0),
      reviews: Number(q('#talent-reviews').value || 0),
      videos,
      views: talent.views || 0,
      likes: talent.likes || 0
    };
    await saveUser(currentProfile.uid, { ...profilePayload, score: calculateScore(talentPayload) });
    await saveTalent(currentProfile.uid, talentPayload);
    await syncUserScore(currentProfile.uid);
    toast('Profile saved successfully.', 'success');
  });

  q('#profile-boost-btn').addEventListener('click', async () => createPiFeaturePayment('boost', { sport: viewedProfile.sport }));
  q('#profile-hall-btn').addEventListener('click', async () => createPiFeaturePayment('hall_of_fame', { sport: viewedProfile.sport, club: viewedProfile.username }));
};

const initHall = async (currentProfile) => {
  const root = q('#page-root');
  root.innerHTML = `
    <div class="glass-card">
      <div class="filter-bar" style="margin-bottom:18px;">
        <select id="hall-sport" class="select"><option value="">${t('hall.allSports', 'All sports')}</option>${SPORTS.map((sport) => `<option value="${sport}">${sport}</option>`).join('')}</select>
        <select id="hall-country" class="select"><option value="">${t('hall.allCountries', 'All countries')}</option>${COUNTRY_OPTIONS.filter((country) => country !== 'Global').map((country) => `<option value="${country}">${country}</option>`).join('')}</select>
        <button class="btn" id="hall-sponsor-btn">${PAYMENT_CATALOG.hall_of_fame.label} · 3 Pi</button>
      </div>
      <div id="hall-list" class="hall-grid"></div>
    </div>
  `;

  let users = [];
  let hall = [];
  const filters = { sport: '', country: '' };

  const render = () => {
    const items = hall.filter((entry) => !filters.sport || entry.sport === filters.sport).map((entry) => {
      const user = users.find((row) => row.uid === entry.playerId) || {};
      return { ...entry, user };
    }).filter((entry) => !filters.country || entry.user.country === filters.country);

    q('#hall-list').innerHTML = items.map((entry) => `
      <article class="hall-card">
        <span class="badge">${entry.sport || entry.user.sport || 'Sport'}</span>
        <h3>${entry.user.username || 'ScoutMe talent'}</h3>
        <p class="muted">${entry.club || 'Club'} · ${entry.user.country || 'Global'}</p>
        <strong>${entry.transferValue || 'Spotlight'}</strong>
        <small class="muted">${formatDate(entry.date || entry.createdAt)}</small>
        <a class="ghost-btn" href="profile.html?uid=${entry.playerId}">${t('common.viewProfile', 'View profile')}</a>
      </article>`).join('') || `<div class="muted">${t('hall.empty', 'No hall entries yet.')}</div>`;
  };

  q('#hall-sport').addEventListener('change', (event) => { filters.sport = event.target.value; render(); });
  q('#hall-country').addEventListener('change', (event) => { filters.country = event.target.value; render(); });
  q('#hall-sponsor-btn').addEventListener('click', async () => createPiFeaturePayment('hall_of_fame', { sport: currentProfile.sport, club: currentProfile.username }));

  listenAllUsers((payload) => { users = payload; render(); });
  listenHall((payload) => { hall = payload; render(); });
};

const initProtectedPage = async () => {
  const currentProfile = await requireProfile();
  if (!currentProfile) return;
  const page = document.body.dataset.page;
  await setupGlobalLanguage(currentProfile);
  setActiveSidebar(page);
  setPageHeader(page);
  const topUsername = q('#top-username');
  if (topUsername) topUsername.textContent = `@${currentProfile.username}`;
  q('#logout-btn')?.addEventListener('click', logout);
  await updatePresence(true);

  if (page === 'dashboard') return initDashboard(currentProfile);
  if (page === 'profile') return initProfile(currentProfile);
  if (page === 'ranking') return initRankingPage({ currentProfile });
  if (page === 'transfer') return initTransferPage({ currentProfile });
  if (page === 'chat') return initChatPage({ currentProfile });
  if (page === 'hall') return initHall(currentProfile);
  if (page === 'metaverse') return initMetaversePage({ currentProfile });
};

const boot = async () => {
  await loadLanguage(localStorage.getItem('scoutme_language') || 'en');
  const page = document.body.dataset.page;
  await setupGlobalLanguage();
  applyTranslations(document);

  if (page === 'landing') return renderLanding();
  if (page === 'login') {
    await ensureFirebaseSession().catch(() => null);
    if (auth.currentUser) {
      const existingProfile = await getUser(auth.currentUser.uid).catch(() => null);
      if (existingProfile) {
        location.href = 'dashboard.html';
        return;
      }
    }
    return renderLogin();
  }

  return initProtectedPage();
};

window.addEventListener('DOMContentLoaded', boot);
