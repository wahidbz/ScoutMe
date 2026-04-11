window.App = (() => {
  const SPORTS = [
    { key: 'football', label: 'Football', type: 'team' },
    { key: 'basketball', label: 'Basketball', type: 'team' },
    { key: 'volleyball', label: 'Volleyball', type: 'team' },
    { key: 'rugby', label: 'Rugby', type: 'team' },
    { key: 'handball', label: 'Handball', type: 'team' },
    { key: 'cricket', label: 'Cricket', type: 'team' },
    { key: 'tennis', label: 'Tennis', type: 'individual' },
    { key: 'boxing', label: 'Boxing', type: 'individual' },
    { key: 'athletics', label: 'Athletics', type: 'individual' },
    { key: 'swimming', label: 'Swimming', type: 'individual' },
    { key: 'cycling', label: 'Cycling', type: 'individual' },
    { key: 'mma', label: 'MMA', type: 'individual' }
  ];

  const SPORT_FIELDS = {
    football: ['speed', 'technique', 'tactical', 'consistency'],
    basketball: ['speed', 'technique', 'tactical', 'consistency'],
    volleyball: ['speed', 'technique', 'tactical', 'consistency'],
    rugby: ['speed', 'technique', 'tactical', 'consistency'],
    tennis: ['speed', 'technique', 'tactical', 'consistency'],
    boxing: ['speed', 'technique', 'tactical', 'consistency'],
    athletics: ['speed', 'technique', 'consistency', 'discipline'],
    swimming: ['speed', 'technique', 'consistency', 'endurance']
  };

  const SPORT_POSITIONS = {
    football: ['GK', 'CB', 'CM', 'RW', 'LW', 'ST'],
    basketball: ['PG', 'SG', 'SF', 'PF', 'C'],
    volleyball: ['Setter', 'Opposite', 'Outside Hitter', 'Middle Blocker', 'Libero'],
    rugby: ['Prop', 'Hooker', 'Lock', 'Fly-half', 'Wing'],
    handball: ['GK', 'Wing', 'Back', 'Pivot'],
    cricket: ['Batter', 'Bowler', 'All-rounder'],
    tennis: ['Singles', 'Doubles'],
    boxing: ['Featherweight', 'Lightweight', 'Middleweight', 'Heavyweight'],
    athletics: ['Sprint', 'Middle-distance', 'Long-distance', 'Jump', 'Throw'],
    swimming: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'],
    cycling: ['Sprinter', 'Climber', 'All-rounder'],
    mma: ['Striker', 'Grappler', 'Hybrid']
  };

  function isTeamSport(sport) {
    return (SPORTS.find((item) => item.key === sport) || {}).type === 'team';
  }

  function sportLabel(sport) {
    return (SPORTS.find((item) => item.key === sport) || {}).label || sport || 'Sport';
  }

  function shellHTML(config, user) {
    const avatarInitials = Utils.initials(user?.username || 'SM');
    return `
      <div class="app-shell">
        <aside class="sidebar glass" id="sidebar">
          <div class="sidebar-header">
            <div class="logo-circle">
              <img src="assets/images/logo.png" alt="ScoutMe" />
            </div>
            <div>
              <div class="brand-title text-gradient">ScoutMe</div>
              <div class="brand-subtitle">Web3 Sports Hub</div>
            </div>
          </div>
          <div class="sidebar-scroll">
            <div class="sidebar-section-label" data-i18n="nav.ecosystem">Ecosystem</div>
            ${navLink('dashboard.html', 'home', 'nav.explore', 'Explore')}
            ${navLink('missions.html', 'target', 'nav.missions', 'Missions')}
            ${navLink('mining.html', 'pickaxe', 'nav.mining', 'SMTK Mining')}
            ${navLink('spin.html', 'refresh-cw', 'nav.spin', 'Lucky Spin')}
            ${navLink('ranking.html', 'trending-up', 'nav.ranking', 'Rankings')}
            
            <div class="sidebar-section-label" data-i18n="nav.network">Network</div>
            ${navLink('transfer.html', 'handshake', 'nav.transfer', 'Transfers')}
            ${navLink('chat.html', 'message-square', 'nav.messages', 'Messages')}
            ${navLink('hall.html', 'award', 'nav.hall', 'Hall of Fame')}
            ${navLink('metaverse.html', 'glasses', 'nav.metaverse', 'Metaverse')}
          </div>
          <div class="sidebar-user glass-strong">
            <div class="avatar sm gold">${avatarInitials}</div>
            <div class="user-info">
              <div class="name">${Utils.escapeHTML(user?.username || 'User')}</div>
              <div class="meta">${App.sportLabel(user?.sport)} • Lv.${user?.scoutLevel || 1}</div>
            </div>
          </div>
        </aside>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <main class="main-panel">
          <header class="topbar">
            <div class="topbar-inner">
              <div class="topbar-actions">
                <button class="btn btn-secondary btn-sm btn-icon hide-desktop" id="sidebar-toggle"><i data-lucide="menu"></i></button>
                <div class="topbar-brand hide-desktop ml-2">
                  <span class="text-gradient" style="font-weight:900">ScoutMe</span>
                </div>
                <div class="header-titles hide-mobile">
                  <div class="page-title" data-i18n="${config.titleKey || ''}">${config.title}</div>
                  <div class="page-subtitle" data-i18n="${config.subtitleKey || ''}">${config.subtitle || ''}</div>
                </div>
              </div>
              <div class="topbar-actions">
                <div class="balance-pill glass-strong">
                  <span class="icon"><i data-lucide="gem" style="color:#27C2FF; width:16px; height:16px;"></i></span>
                  <span class="value">${Number((user?.balances || {}).smtk || 0).toFixed(1)} SMTK</span>
                </div>
                <button class="btn btn-secondary btn-sm btn-icon" onclick="I18n.showModal()">
                  <i data-lucide="languages"></i>
                </button>
                <button class="btn btn-secondary btn-sm btn-icon" id="notif-button">
                  <i data-lucide="bell"></i> <span class="badge-count" id="notif-count">0</span>
                </button>
                <button class="btn btn-secondary btn-sm btn-icon" onclick="App.showStore()">
                  <i data-lucide="shopping-cart"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-icon" id="logout-btn"><i data-lucide="log-out"></i></button>
              </div>
            </div>
          </header>
          <div class="page" id="page-content"></div>
        </main>
        <nav class="bottom-nav hide-desktop glass">
          <a href="/dashboard.html" class="bottom-nav-item" data-page="dashboard.html">
            <span class="icon"><i data-lucide="home"></i></span><span class="label" data-i18n="nav.explore">Explore</span>
          </a>
          <a href="/mining.html" class="bottom-nav-item" data-page="mining.html">
            <span class="icon"><i data-lucide="pickaxe"></i></span><span class="label" data-i18n="nav.mining">Mining</span>
          </a>
          <a href="/spin.html" class="bottom-nav-item" data-page="spin.html">
            <span class="icon"><i data-lucide="refresh-cw"></i></span><span class="label" data-i18n="nav.spin">Spin</span>
          </a>
          <a href="/chat.html" class="bottom-nav-item" data-page="chat.html">
            <span class="icon"><i data-lucide="message-square"></i></span><span class="label" data-i18n="nav.messages">Chat</span>
          </a>
          <button class="bottom-nav-item" id="bottom-menu-toggle">
            <span class="icon"><i data-lucide="menu"></i></span><span class="label" data-i18n="nav.menu">Menu</span>
          </button>
        </nav>
      </div>
      <div class="modal-backdrop" id="notif-modal">
        <div class="modal glass">
          <div class="row-between"><h3 class="mt-0">Intelligence Hub</h3><button class="btn btn-ghost" id="close-notif">✕</button></div>
          <div id="notif-list" class="card-list mt-3"></div>
        </div>
      </div>
      <div class="modal-backdrop" id="shop-modal">
        <div class="modal glass" style="max-width: 680px">
          <div class="row-between">
            <div>
              <h3 class="mt-0" data-i18n="shop.title">Pi Sports Shop</h3>
              <div class="small text-muted" data-i18n="shop.subtitle">Boost your career with Pi tokens.</div>
            </div>
            <button class="btn btn-ghost" id="close-shop">✕</button>
          </div>
          <div class="shop-grid">
            <div class="plan-card" onclick="App.handlePurchase('boost')">
              <span class="plan-icon">🚀</span>
              <div class="plan-name" data-i18n="shop.boost_name">Profile Boost</div>
              <div class="plan-desc" data-i18n="shop.boost_desc">7 days of high visibility to scouts.</div>
              <div class="plan-price">1 <span class="pi-logo">π</span></div>
            </div>
            <div class="plan-card" onclick="App.handlePurchase('unlock_contact')">
              <span class="plan-icon">🔓</span>
              <div class="plan-name" data-i18n="shop.contact_name">Direct Contact</div>
              <div class="plan-desc" data-i18n="shop.contact_desc">Unlock message access to any club.</div>
              <div class="plan-price">2 <span class="pi-logo">π</span></div>
            </div>
            <div class="plan-card" onclick="App.handlePurchase('hall_of_fame')">
              <span class="plan-icon">🏛️</span>
              <div class="plan-name" data-i18n="shop.hall_name">Hall of Fame</div>
              <div class="plan-desc" data-i18n="shop.hall_desc">Instant premium card in the Metaverse.</div>
              <div class="plan-price">3 <span class="pi-logo">π</span></div>
            </div>
            <div class="plan-card" onclick="App.handlePurchase('club_subscription')">
              <span class="plan-icon">🏟️</span>
              <div class="plan-name" data-i18n="shop.club_name">Club Premium</div>
              <div class="plan-desc" data-i18n="shop.club_desc">30 days of advanced club management.</div>
              <div class="plan-price">5 <span class="pi-logo">π</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function navLink(page, icon, i18nKey, label) {
    return `<a href="/${page}" class="nav-link" data-page="${page}"><i data-lucide="${icon}"></i> <span data-i18n="${i18nKey}">${label}</span></a>`;
  }

  async function start(config = {}) {
    await I18n.init();
    ScoutMeFirebase.initPi();
    const authUser = config.requireAuth === false ? null : await Auth.requireAuth(true);
    let profile = authUser ? await DB.getUser(authUser.uid) : null;

    if (config.requireProfile && authUser && !profile?.role) {
      location.href = '/login.html';
      return null;
    }

    if (config.shell !== false) {
      document.getElementById('app-shell').innerHTML = shellHTML(config, profile || {});
      if (window.lucide) lucide.createIcons();
      Utils.setActiveNav();
      Utils.sidebarToggle();
      bindGlobalUI(profile);
      initNotifications(profile);
      initServiceWorker();
      document.querySelectorAll('[data-language-select]').forEach((select) => {
        select.value = profile?.language || Utils.getLocale() || 'en';
        select.addEventListener('change', async (event) => {
          await I18n.handleChange(event.target.value, profile);
          location.reload();
        });
      });
    }


    return profile;
  }

  function bindGlobalUI(profile) {
    document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());
    document.getElementById('notif-button')?.addEventListener('click', () => document.getElementById('notif-modal').classList.add('show'));
    document.getElementById('close-notif')?.addEventListener('click', () => document.getElementById('notif-modal').classList.remove('show'));
    document.getElementById('close-shop')?.addEventListener('click', () => document.getElementById('shop-modal').classList.remove('show'));
  }

  function showStore() {
    document.getElementById('shop-modal')?.classList.add('show');
  }

  async function handlePurchase(planKey) {
    const user = await Auth.requireAuth();
    if (!user) return;
    try {
      await Payment.createPayment(planKey, user);
      document.getElementById('shop-modal')?.classList.remove('show');
    } catch (error) {
      console.error('Purchase failed', error);
    }
  }

  function initNotifications(profile) {
    if (!profile?.uid) return;
    DB.listenNotifications(profile.uid, (rows) => {
      const unread = rows.filter((row) => !row.read).length;
      const count = document.getElementById('notif-count');
      if (count) count.textContent = unread;
      const list = document.getElementById('notif-list');
      if (list) {
        list.innerHTML = rows.length ? rows.map((row) => `
          <div class="notif-card">
            <div class="row-between"><strong>${Utils.escapeHTML(row.title || 'Notification')}</strong>${row.read ? '' : '<span class="badge green">new</span>'}</div>
            <div class="small text-muted mt-1">${Utils.escapeHTML(row.message || '')}</div>
            <div class="row-between mt-2"><span class="small text-muted">${Utils.timeAgo(row.createdAt)}</span><button class="btn btn-secondary btn-sm" data-notif-id="${row.id}" data-link="${row.link || ''}">Open</button></div>
          </div>
        `).join('') : Utils.emptyState('🔕', 'No notifications', 'You are all caught up.');
        list.querySelectorAll('[data-notif-id]').forEach((button) => {
          button.addEventListener('click', async () => {
            await DB.markNotificationRead(button.dataset.notifId);
            if (button.dataset.link) location.href = button.dataset.link;
          });
        });
      }
    });
  }

  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch((err) => console.log('SW setup failed:', err));
      });
    }
  }

  return {
    SPORTS,
    SPORT_FIELDS,
    SPORT_POSITIONS,
    isTeamSport,
    sportLabel,
    start,
    showStore,
    handlePurchase
  };
})();
