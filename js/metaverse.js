import { listenAllUsers, listenHall } from '/js/database.js';
import { q } from '/js/utils.js';
import { t } from '/js/i18n.js';

export const initMetaversePage = async () => {
  const root = q('#page-root');
  root.innerHTML = `
    <div class="glass-card">
      <h3>${t('metaverse.title', '3D ScoutMe Museum')}</h3>
      <p class="muted">${t('metaverse.subtitle', 'Click any player panel to open the profile.')}</p>
      <div id="metaverse-scene" class="metaverse-embed"></div>
    </div>
  `;

  let users = [];
  let hall = [];
  const renderScene = () => {
    const entries = hall.slice(0, 12).map((entry, index) => {
      const user = users.find((row) => row.uid === entry.playerId);
      const x = (index % 4) * 4 - 6;
      const z = -Math.floor(index / 4) * 5 - 4;
      const label = `${user?.username || 'Player'} | ${entry.sport || user?.sport || 'Sport'}`;
      return `
        <a-entity position="${x} 1.8 ${z}">
          <a-plane color="#0b1610" width="3.2" height="2.2" material="opacity:0.86"></a-plane>
          <a-text value="${label}" color="#FFD700" align="center" width="5" position="0 0.5 0.02"></a-text>
          <a-text value="${entry.transferValue || 'Spotlight'}" color="#FFFFFF" align="center" width="4" position="0 0 0.02"></a-text>
          <a-box class="clickable" data-uid="${user?.uid || ''}" color="#00C853" depth="0.12" height="0.45" width="1.8" position="0 -0.62 0.06"></a-box>
          <a-text value="Open Profile" color="#03130c" align="center" width="3.6" position="0 -0.62 0.12"></a-text>
        </a-entity>`;
    }).join('');

    q('#metaverse-scene').innerHTML = `
      <a-scene embedded background="color:#050706" vr-mode-ui="enabled:false">
        <a-assets></a-assets>
        <a-entity light="type:ambient;color:#88ffbe;intensity:0.65"></a-entity>
        <a-entity light="type:point;color:#FFD700;intensity:1.1;distance:30" position="0 8 0"></a-entity>
        <a-sky color="#020403"></a-sky>
        <a-plane rotation="-90 0 0" width="40" height="40" color="#0b1610"></a-plane>
        <a-entity position="0 1.6 6">
          <a-camera></a-camera>
        </a-entity>
        ${entries}
      </a-scene>`;

    q('#metaverse-scene').querySelectorAll('.clickable').forEach((node) => {
      node.addEventListener('click', () => {
        const uid = node.getAttribute('data-uid');
        if (uid) location.href = `/public/profile.html?uid=${uid}`;
      });
    });
  };

  listenAllUsers((payload) => { users = payload; renderScene(); });
  listenHall((payload) => { hall = payload; renderScene(); });
};
