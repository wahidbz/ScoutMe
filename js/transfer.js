window.Transfer = (() => {
  function renderCard(transfer, currentUser) {
    const isClub = currentUser.role === 'club';
    const canAccept = !isClub && transfer.status === 'pending';
    const canComplete = isClub && transfer.status === 'accepted';
    return `
      <div class="transfer-card">
        <div class="transfer-meta">
          <div>
            <div style="font-weight:900">${Utils.escapeHTML(transfer.playerName || 'Unknown Player')}</div>
            <div class="small text-muted mt-1">${Utils.escapeHTML(transfer.clubName || 'Club')} • ${Utils.escapeHTML(transfer.sport || '')}</div>
          </div>
          <span class="status-pill ${transfer.status}">${transfer.status}</span>
        </div>
        <div class="grid-3 mt-2">
          <div><div class="small text-muted">Value</div><strong>${transfer.offerValue} ${transfer.currency || 'PI'}</strong></div>
          <div><div class="small text-muted">Season</div><strong>${transfer.season || '2026'}</strong></div>
          <div><div class="small text-muted">Contract</div><strong>${transfer.contractStatus || 'proposal'}</strong></div>
        </div>
        <div class="small text-muted mt-2">${Utils.escapeHTML(transfer.message || 'No note added.')}</div>
        <div class="page-actions mt-3">
          ${canAccept ? `<button class="btn btn-success btn-sm" data-transfer-action="accept" data-id="${transfer.id}">Accept</button><button class="btn btn-danger btn-sm" data-transfer-action="reject" data-id="${transfer.id}">Reject</button>` : ''}
          ${canComplete ? `<button class="btn btn-primary btn-sm" data-i18n="transfer.bid" data-transfer-action="complete" data-id="${transfer.id}">Mark completed</button>` : ''}
        </div>
      </div>
    `;
  }

  async function mount(rootId, user) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = `
      <div class="grid-2">
        <section class="glass panel">
          <h3 class="panel-title">🔄 Transfer center</h3>
          <div id="transfer-list" class="card-list"></div>
        </section>
        <section class="glass panel">
          <h3 class="panel-title">✍️ Create offer</h3>
          <form id="transfer-form" class="stack">
            <div class="form-group">
              <label class="form-label">Player UID</label>
              <div class="row-between" style="gap:10px">
                <input class="input" id="tf-player-id" required placeholder="Enter player uid" />
                <button type="button" class="btn btn-secondary btn-sm" id="tf-search-btn">Find Player</button>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Player name</label><input class="input" id="tf-player-name" required placeholder="Player display name" /></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Sport</label><select class="select" id="tf-sport">${App.SPORTS.map((sport) => `<option value="${sport.key}" ${sport.key === user.sport ? 'selected' : ''}>${sport.label}</option>`).join('')}</select></div>
              <div class="form-group"><label class="form-label">Offer value</label><input class="input" type="number" id="tf-value" min="1" value="10" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Currency</label><input class="input" id="tf-currency" value="PI" /></div>
              <div class="form-group"><label class="form-label">Country</label><input class="input" id="tf-country" value="${Utils.escapeHTML(user.country || '')}" /></div>
            </div>
            <div class="form-group"><label class="form-label">Contract message</label><textarea class="textarea" id="tf-message" placeholder="Explain the role, signing vision, and contract roadmap."></textarea></div>
            <button class="btn btn-primary" ${user.role !== 'club' ? 'disabled' : ''}>Send transfer offer</button>
            ${user.role !== 'club' ? '<div class="notice warning">Only club profiles can create transfer offers.</div>' : ''}
          </form>
        </section>
      </div>
    `;

    const listNode = document.getElementById('transfer-list');
    const unsub = DB.listenTransfers(user, (transfers) => {
      listNode.innerHTML = transfers.length ? transfers.map((transfer) => renderCard(transfer, user)).join('') : Utils.emptyState('📨', 'No transfer activity', 'Offers and contract updates will appear here.');
      listNode.querySelectorAll('[data-transfer-action]').forEach((button) => {
        button.addEventListener('click', async () => {
          const action = button.dataset.transferAction;
          const id = button.dataset.id;
          const map = { accept: 'accepted', reject: 'rejected', complete: 'completed' };
          try {
            await DB.updateTransferStatus(id, map[action], user);
            Utils.toast('success', 'Transfer updated', `Status changed to ${map[action]}.`);
          } catch (error) {
            Utils.toast('error', 'Transfer failed', error.message || 'Could not update transfer.');
          }
        });
      });
    });

    document.getElementById('transfer-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (user.role !== 'club') return;
      try {
        await DB.createTransfer({
          playerId: document.getElementById('tf-player-id').value.trim(),
          playerName: document.getElementById('tf-player-name').value.trim(),
          sport: document.getElementById('tf-sport').value,
          offerValue: Number(document.getElementById('tf-value').value || 0),
          currency: document.getElementById('tf-currency').value.trim() || 'PI',
          country: document.getElementById('tf-country').value.trim(),
          message: document.getElementById('tf-message').value.trim(),
          season: '2026'
        }, user);
        Utils.toast('success', 'Offer sent', 'Transfer offer has been created.');
        event.target.reset();
      } catch (error) {
        Utils.toast('error', 'Create offer failed', error.message || 'Unable to send offer.');
      }
    });

    document.getElementById('tf-search-btn')?.addEventListener('click', async () => {
      const query = prompt('Search player by username:');
      if (!query) return;
      Utils.showLoader('Searching...');
      try {
        const users = await DB.listUsers({ roles: ['player'] });
        const found = users.find(u => u.username.toLowerCase().includes(query.toLowerCase()));
        if (found) {
          document.getElementById('tf-player-id').value = found.uid;
          document.getElementById('tf-player-name').value = found.username;
          Utils.toast('success', 'Player found', found.username);
        } else {
          Utils.toast('warning', 'Not found', 'No player matching that name.');
        }
      } catch (e) {
        Utils.toast('error', 'Search error', e.message);
      } finally {
        Utils.hideLoader();
      }
    });

    return () => unsub?.();
  }

  return { mount, renderCard };
})();
