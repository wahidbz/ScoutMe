import { auth } from '/js/firebase.js';
import { createHallEntry, createNotification, createTransfer, listenAllUsers, listenTransfers, updateTransfer } from '/js/database.js';
import { COUNTRY_OPTIONS, numberFormat, q, SPORTS, toast } from '/js/utils.js';
import { createPiFeaturePayment } from '/js/payment.js';
import { t, applyTranslations } from '/js/i18n.js';

export const initTransferPage = async ({ currentProfile }) => {
  const root = q('#page-root');
  root.innerHTML = `
    <div class="transfer-grid">
      <section class="glass-card">
        <div class="page-header">
          <div>
            <h3>${t('transfer.marketTitle', 'Transfer board')}</h3>
            <p class="muted">${t('transfer.marketSubtitle', 'Live offers and negotiation status updates.')}</p>
          </div>
        </div>
        <div id="transfer-list" class="offer-list"></div>
      </section>
      <aside class="glass-card">
        <h3>${t('transfer.createTitle', 'Create an offer')}</h3>
        <p class="muted">${t('transfer.createSubtitle', 'Available only for club accounts.')}</p>
        <form id="transfer-form" class="form-grid">
          <div class="form-row"><label>${t('profile.sport', 'Sport')}</label><select id="transfer-sport" class="select">${SPORTS.map((sport) => `<option value="${sport}">${sport}</option>`).join('')}</select></div>
          <div class="form-row"><label>${t('transfer.player', 'Player')}</label><select id="transfer-player" class="select"></select></div>
          <div class="form-row"><label>${t('transfer.offer', 'Offer')}</label><input id="transfer-offer" class="input" placeholder="250000€ or 10 Pi signing bonus" /></div>
          <div class="form-row"><label>${t('transfer.country', 'Country')}</label><select id="transfer-country" class="select">${COUNTRY_OPTIONS.map((country) => `<option value="${country}">${country}</option>`).join('')}</select></div>
          <div class="form-row" style="grid-column:1/-1;"><label>${t('transfer.notes', 'Notes')}</label><textarea id="transfer-notes" class="textarea"></textarea></div>
          <div class="form-row" style="grid-column:1/-1;"><button class="btn btn-green" type="submit">${t('transfer.sendOffer', 'Send offer')}</button></div>
        </form>
        <div style="margin-top:18px;" class="form-card">
          <h4>${t('transfer.hallBoostTitle', 'Hall of Fame boost')}</h4>
          <p class="muted">${t('transfer.hallBoostText', 'Promote an accepted move into the Hall of Fame via Pi payment.')}</p>
          <button id="hall-boost-btn" class="ghost-btn">${t('transfer.hallBoostAction', 'Pay 3 Pi for Hall of Fame')}</button>
        </div>
      </aside>
    </div>
  `;
  applyTranslations(root);

  const playerSelect = q('#transfer-player');
  const transferForm = q('#transfer-form');
  if (currentProfile.role !== 'club') {
    transferForm.classList.add('hidden');
    q('#hall-boost-btn').classList.remove('hidden');
  }

  let users = [];
  let transfers = [];

  const populatePlayers = () => {
    const sport = q('#transfer-sport').value;
    const players = users.filter((user) => user.role === 'player' && user.sport === sport);
    playerSelect.innerHTML = players.map((player) => `<option value="${player.uid}">${player.username} · ${player.position || 'Athlete'}</option>`).join('') || `<option value="">${t('transfer.noPlayers', 'No players available')}</option>`;
  };

  const renderTransfers = () => {
    const scoped = transfers.filter((transfer) => transfer.playerId === currentProfile.uid || transfer.clubId === currentProfile.uid);
    q('#transfer-list').innerHTML = scoped.map((offer) => {
      const player = users.find((user) => user.uid === offer.playerId);
      const club = users.find((user) => user.uid === offer.clubId);
      const isPlayer = offer.playerId === currentProfile.uid;
      const isClub = offer.clubId === currentProfile.uid;
      const actionButtons = [];
      if (isPlayer && offer.status === 'pending') {
        actionButtons.push(`<button class="ghost-btn" data-accept="${offer.id}">${t('transfer.accept', 'Accept')}</button>`);
        actionButtons.push(`<button class="ghost-btn" data-reject="${offer.id}">${t('transfer.reject', 'Reject')}</button>`);
      }
      if (isClub && offer.status === 'accepted') {
        actionButtons.push(`<button class="btn" data-complete="${offer.id}">${t('transfer.complete', 'Complete')}</button>`);
      }
      return `
        <article class="transfer-card">
          <div class="transfer-meta">
            <span class="badge ${offer.status === 'pending' ? 'warning' : offer.status === 'accepted' ? '' : 'dark'}">${offer.status}</span>
            <span>${offer.offer}</span>
          </div>
          <h3>${player?.username || 'Player'} → ${club?.username || 'Club'}</h3>
          <p class="muted">${offer.notes || '--'} · ${offer.country || 'Global'} · ${offer.sport || player?.sport || 'Sport'}</p>
          <div class="inline-actions">${actionButtons.join('')}</div>
        </article>`;
    }).join('') || `<div class="muted">${t('transfer.empty', 'No offers yet.')}</div>`;

    root.querySelectorAll('[data-accept]').forEach((button) => button.addEventListener('click', async () => {
      await updateTransfer(button.dataset.accept, { status: 'accepted' });
      toast('Offer accepted.', 'success');
    }));
    root.querySelectorAll('[data-reject]').forEach((button) => button.addEventListener('click', async () => {
      await updateTransfer(button.dataset.reject, { status: 'rejected' });
      toast('Offer rejected.', 'error');
    }));
    root.querySelectorAll('[data-complete]').forEach((button) => button.addEventListener('click', async () => {
      const offer = transfers.find((item) => item.id === button.dataset.complete);
      await updateTransfer(button.dataset.complete, { status: 'completed' });
      await createHallEntry({ playerId: offer.playerId, transferValue: offer.offer, club: currentProfile.username, sport: offer.sport || currentProfile.sport });
      await createNotification({ userId: offer.playerId, type: 'transfer', message: `Your transfer to ${currentProfile.username} is completed.` });
      toast('Transfer completed and added to Hall of Fame.', 'success');
    }));
  };

  q('#transfer-sport').addEventListener('change', populatePlayers);
  q('#hall-boost-btn').addEventListener('click', async () => {
    await createPiFeaturePayment('hall_of_fame', { sport: currentProfile.sport, club: currentProfile.username, transferValue: '3 Pi Spotlight' });
  });

  transferForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (currentProfile.role !== 'club') return toast('Only clubs can create offers.', 'error');
    const playerId = playerSelect.value;
    if (!playerId) return toast('Select a player first.', 'error');
    const payload = {
      playerId,
      clubId: auth.currentUser.uid,
      offer: q('#transfer-offer').value.trim() || '1 Pi trial offer',
      sport: q('#transfer-sport').value,
      country: q('#transfer-country').value,
      notes: q('#transfer-notes').value.trim()
    };
    await createTransfer(payload);
    await createNotification({ userId: playerId, type: 'transfer', message: `${currentProfile.username} sent you a transfer offer.` });
    transferForm.reset();
    populatePlayers();
    toast('Transfer offer sent.', 'success');
  });

  listenAllUsers((payload) => { users = payload; populatePlayers(); renderTransfers(); });
  listenTransfers((payload) => { transfers = payload; renderTransfers(); });
};
