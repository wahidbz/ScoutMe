window.Metaverse = (() => {
  async function mount(rootId, user) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const leaderboard = await DB.listUsers({ roles: ['player'] });
    const top3 = leaderboard.slice(0, 3);

    root.innerHTML = `
      <section class="glass panel mb-3">
        <div class="row-between">
          <div>
            <h3 class="panel-title" data-i18n="metaverse.title">🕶️ ScoutMe Metaverse Museum</h3>
            <div class="small text-muted" data-i18n="metaverse.desc">A-Frame Virtual Showcase • Use WASD + Mouse to explore the 3D gallery.</div>
          </div>
          <div class="badge gold" data-i18n="metaverse.mode">Explorer Mode Active</div>
        </div>
      </section>
      <div class="aframe-wrap glass-strong">
        <a-scene embedded background="color: #0a1124" cursor="fuse: false; rayOrigin: mouse">
          <a-assets>
            <img id="museum-logo" src="assets/images/logo.png" alt="ScoutMe" />
            <img id="wall-texture" src="https://cdn.aframe.io/a- Painter/images/floor.jpg" crossorigin="anonymous" />
          </a-assets>

          <!-- Camera & Controls -->
          <a-entity position="0 1.6 6">
            <a-camera wasd-controls="acceleration: 45" look-controls></a-camera>
          </a-entity>

          <!-- Environment -->
          <a-sky color="#081120"></a-sky>
          <a-plane rotation="-90 0 0" width="40" height="40" color="#0f1730" material="roughness: 1; metalness: 0"></a-plane>
          
          <!-- Main Hall -->
          <a-box position="0 2 -5" depth="0.5" height="4" width="16" color="#122040" material="opacity: 0.9; transparent: true"></a-box>
          <a-image src="#museum-logo" position="0 3.2 -4.7" width="1.5" height="1.5"></a-image>
          <a-text value="THE SCOUTME HALL" color="#FFD700" align="center" position="0 4.2 -4.7" width="10" font="exo2bold"></a-text>

          <!-- Interactive Player Panels -->
          ${top3.map((player, i) => `
            <a-entity position="${(i - 1) * 4} 1.8 -4.7">
              <a-plane width="3" height="2.2" color="#1a2b50" material="opacity: 0.8">
                <a-text value="${Utils.escapeHTML(player.username)}" color="#00C853" align="center" position="0 0.6 0.05" width="5"></a-text>
                <a-text value="${App.sportLabel(player.sport)}" color="#ffffff" align="center" position="0 0.2 0.05" width="3.5"></a-text>
                <a-text value="SCORE: ${player.score || 0}" color="#FFD700" align="center" position="0 -0.2 0.05" width="4"></a-text>
                <a-plane width="2.2" height="0.4" position="0 -0.7 0.06" color="#00C853" 
                         class="clickable" 
                         onclick="window.location.href='profile.html?uid=${player.uid}'">
                  <a-text value="VIEW PROFILE" color="#ffffff" align="center" position="0 0 0.01" width="3"></a-text>
                </a-plane>
              </a-plane>
            </a-entity>
          `).join('')}

          <!-- Lighting -->
          <a-entity light="type: ambient; color: #fff; intensity: 0.4"></a-entity>
          <a-entity light="type: spot; intensity: 1.5; color: #00C853; angle: 45" position="0 6 2" rotation="-45 0 0"></a-entity>
          <a-entity light="type: point; intensity: 0.8; color: #FFD700" position="-5 3 0"></a-entity>
          <a-entity light="type: point; intensity: 0.8; color: #FFD700" position="5 3 0"></a-entity>

          <!-- Decorative Pillars -->
          <a-cylinder position="-8 2 -5" radius="0.4" height="4" color="#122040"></a-cylinder>
          <a-cylinder position="8 2 -5" radius="0.4" height="4" color="#122040"></a-cylinder>
        </a-scene>
      </div>
      <section class="glass panel mt-3">
        <h4 class="mt-0">Museum Controls</h4>
        <div class="row-between">
          <div class="small text-muted">Desktop: WASD to move, Click-drag to look.</div>
          <div class="small text-muted">Mobile: Touch drag to looking, Use virtual joysticks inside A-Frame (if enabled).</div>
        </div>
      </section>
    `;
      if (window.I18n) I18n.translateDOM(root);
  }

  return { mount };
})();
