export const WALLET_ADDRESS = 'GC7KBK7553NTMDD4O6OJBUY2QOPSVW7SKXWOJITVMKPIVD6ZDSPMGWPH';

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' }
];

export const SPORT_GROUPS = {
  'Football': ['Goalkeeper', 'Defender', 'Midfielder', 'Winger', 'Striker'],
  'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  'Volleyball': ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero'],
  'Handball': ['Goalkeeper', 'Wing', 'Back', 'Playmaker', 'Pivot'],
  'Rugby': ['Prop', 'Hooker', 'Lock', 'Flanker', 'Scrum Half', 'Fly Half', 'Center', 'Wing', 'Fullback'],
  'Cricket': ['Batter', 'Bowler', 'All-rounder', 'Wicket-Keeper'],
  'Baseball': ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'],
  'Hockey': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
  'Futsal': ['Goalkeeper', 'Defender', 'Winger', 'Pivot'],
  'American Football': ['Quarterback', 'Running Back', 'Wide Receiver', 'Linebacker', 'Cornerback', 'Safety'],
  'Tennis': ['Singles Specialist', 'Doubles Specialist', 'All-Court Player'],
  'Table Tennis': ['Attacker', 'Defender', 'All-Rounder'],
  'Athletics': ['Sprinter', 'Middle Distance', 'Long Distance', 'Jumper', 'Thrower'],
  'Boxing': ['Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Middleweight', 'Heavyweight'],
  'MMA': ['Striker', 'Grappler', 'Hybrid'],
  'Wrestling': ['Freestyle', 'Greco-Roman', 'Submission'],
  'Judo': ['Lightweight', 'Middleweight', 'Heavyweight'],
  'Karate': ['Kata', 'Kumite'],
  'Taekwondo': ['Poomsae', 'Sparring'],
  'Swimming': ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Medley'],
  'Cycling': ['Road', 'Track', 'MTB', 'BMX'],
  'Gymnastics': ['Artistic', 'Rhythmic', 'Trampoline'],
  'Weightlifting': ['Snatch Specialist', 'Clean & Jerk Specialist', 'Olympic Lifter'],
  'Bodybuilding': ['Classic Physique', 'Men\'s Physique', 'Open', 'Bikini', 'Wellness'],
  'Running': ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra'],
  'Triathlon': ['Sprint', 'Olympic', 'Ironman'],
  'default': ['Athlete', 'Competitor', 'Specialist']
};

export const SPORTS = Object.keys(SPORT_GROUPS).filter((key) => key !== 'default');

export const COUNTRY_OPTIONS = ['Global', 'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Saudi Arabia', 'UAE', 'France', 'Spain', 'Portugal', 'Germany', 'Italy', 'Turkey', 'India', 'China', 'Japan', 'Brazil', 'Argentina', 'USA', 'UK', 'Nigeria', 'South Africa'];

export const PAYMENT_CATALOG = {
  boost: { amount: 1, key: 'boost', label: 'Boost profile', description: 'Boost profile visibility for 7 days.' },
  unlock_contact: { amount: 2, key: 'unlock_contact', label: 'Unlock contact', description: 'Unlock direct contact information.' },
  hall_of_fame: { amount: 3, key: 'hall_of_fame', label: 'Hall of Fame entry', description: 'Promote your profile inside the Hall of Fame.' }
};

export const DEFAULT_TALENT = {
  stats: { skills: 50, activity: 40, reviews: 20, videos: 1 },
  videos: [],
  views: 0,
  likes: 0,
  activity: 40,
  reviews: 20
};

export const q = (selector, root = document) => root.querySelector(selector);
export const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getInitials = (text = '') => text.split(/\s+/).filter(Boolean).slice(0, 2).map((chunk) => chunk[0]?.toUpperCase()).join('') || 'SM';

export const formatDate = (value) => {
  if (!value) return '--';
  const date = value?.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

export const formatRelative = (value) => {
  if (!value) return 'now';
  const date = value?.toDate ? value.toDate() : new Date(value);
  const diff = Date.now() - date.getTime();
  const min = Math.max(1, Math.floor(diff / 60000));
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const numberFormat = (value = 0) => new Intl.NumberFormat().format(Number(value || 0));

export const slugConversation = (a, b) => [a, b].sort().join('__');

export const calculateScore = (talent = DEFAULT_TALENT) => {
  const stats = talent.stats || {};
  const skills = Number(stats.skills ?? talent.skills ?? 0);
  const activity = Number(stats.activity ?? talent.activity ?? 0);
  const reviews = Number(stats.reviews ?? talent.reviews ?? 0);
  const rawVideos = stats.videos ?? (Array.isArray(talent.videos) ? talent.videos.length : (talent.videos ?? 0));
  const videos = Number(rawVideos);
  return Number(((skills * 0.4) + (activity * 0.2) + (reviews * 0.2) + (videos * 0.2)).toFixed(2));
};

export const renderLanguageOptions = (select, selected = 'en') => {
  if (!select) return;
  select.innerHTML = LANGUAGE_OPTIONS.map(({ code, label }) => `<option value="${code}" ${code === selected ? 'selected' : ''}>${label}</option>`).join('');
};

export const renderPositionOptions = (sport, selected = '') => {
  const positions = SPORT_GROUPS[sport] || SPORT_GROUPS.default;
  return positions.map((position) => `<option value="${position}" ${position === selected ? 'selected' : ''}>${position}</option>`).join('');
};

export const toast = (message, type = 'info') => {
  const node = document.createElement('div');
  node.className = 'glass-card';
  node.style.position = 'fixed';
  node.style.bottom = '24px';
  node.style.insetInlineEnd = '24px';
  node.style.padding = '16px 18px';
  node.style.zIndex = '200';
  node.style.maxWidth = '360px';
  node.style.borderColor = type === 'error' ? 'rgba(255,91,107,0.35)' : type === 'success' ? 'rgba(0,200,83,0.35)' : 'rgba(255,215,0,0.28)';
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 3200);
};

export const setHTML = (selector, html) => {
  const element = typeof selector === 'string' ? q(selector) : selector;
  if (element) element.innerHTML = html;
};

export const escapeHtml = (value = '') => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const getYouTubeEmbed = (url = '') => {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/i);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};

export const getTikTokEmbed = (url = '') => {
  if (!url.includes('tiktok.com')) return '';
  return url;
};

export const buildScoreRing = (score = 0, label = 'Score') => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, Number(score)));
  const offset = circumference - ((pct / 100) * circumference);
  return `
    <div class="score-ring">
      <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
        <circle cx="66" cy="66" r="54" stroke="rgba(255,255,255,0.12)" stroke-width="10" fill="none"></circle>
        <circle cx="66" cy="66" r="54" stroke="url(#ringGradient)" stroke-width="10" stroke-linecap="round" fill="none"
          stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFD700"></stop>
            <stop offset="100%" stop-color="#00C853"></stop>
          </linearGradient>
        </defs>
      </svg>
      <div class="score-ring-value"><div>${pct.toFixed(1)}</div><small>${label}</small></div>
    </div>
  `;
};

export const simpleLineBars = (points = []) => {
  const safe = points.length ? points : [20, 40, 32, 68, 54, 78, 88];
  const max = Math.max(...safe, 100);
  return `<div class="toolbar">${safe.map((value, index) => `
    <div style="flex:1;min-width:30px;text-align:center;">
      <div style="height:180px;display:flex;align-items:flex-end;justify-content:center;">
        <div style="width:22px;height:${Math.max(18, (value / max) * 160)}px;border-radius:999px;background:linear-gradient(180deg,#FFD700,#00C853);"></div>
      </div>
      <small class="muted">W${index + 1}</small>
    </div>`).join('')}</div>`;
};

export const profileBadge = (user = {}) => {
  if (user.verified && Number(user.score || 0) >= 75) return 'Elite';
  if (user.verified) return 'Pro';
  return 'Verified';
};

export const computeRecommendations = (users = [], current = {}) => {
  return users
    .filter((user) => user.uid !== current.uid && user.role !== current.role)
    .map((user) => ({ ...user, recommendationScore: (user.sport === current.sport ? 35 : 10) + Number(user.score || 0) + (user.verified ? 12 : 0) }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 5);
};

export const setActiveSidebar = (page) => {
  qa('[data-link]').forEach((link) => {
    link.classList.toggle('active', link.dataset.link === page);
  });
};
