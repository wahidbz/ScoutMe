window.Chat = (() => {
  let activeConversation = null;
  let activeReceiver = null;
  let unlistenConversations = null;
  let unlistenMessages = null;

  function conversationRow(conv, currentUser) {
    const otherUid = (conv.members || []).find((member) => member !== currentUser.uid);
    const otherName = (conv.memberNames || []).find((name) => name && name !== currentUser.username) || otherUid || 'Scout';
    const unread = Number((conv.unreadMap || {})[currentUser.uid] || 0);
    return `
      <div class="chat-item" data-conversation="${conv.id}" data-other-uid="${otherUid}" data-other-name="${Utils.escapeHTML(otherName)}">
        <div class="avatar">${Utils.initials(otherName)}</div>
        <div style="flex:1;min-width:0">
          <div class="row-between"><strong>${Utils.escapeHTML(otherName)}</strong><span class="small text-muted">${Utils.timeAgo(conv.lastAt)}</span></div>
          <div class="small text-muted mt-1" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${Utils.escapeHTML(conv.lastMessage || 'Start the conversation')}</div>
        </div>
        ${unread ? `<span class="badge green">${unread}</span>` : ''}
      </div>
    `;
  }

  function messageBubble(message, currentUser) {
    const mine = message.senderId === currentUser.uid;
    const date = Utils.toDate(message.createdAt);
    const timeStr = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    return `
      <div class="message-wrapper ${mine ? 'mine' : 'theirs'}">
        <div class="message-bubble ${mine ? 'bubble-primary' : 'glass-strong'}">
          <div class="text">${Utils.escapeHTML(message.text || '')}</div>
          <div class="message-meta">
            <span class="time">${timeStr}</span>
            ${mine ? `<span class="status-icon">${message.seen ? '✓✓' : '✓'}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  async function mount(rootId, currentUser) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.innerHTML = `
      <div class="chat-shell">
        <section class="chat-list">
          <div class="chat-list-header">
            <div class="row-between">
              <strong>💬 Conversations</strong>
              <button class="btn btn-secondary btn-sm" id="new-chat-btn">New chat</button>
            </div>
          </div>
          <div class="chat-items" id="conversation-list"></div>
        </section>
        <section class="chat-window">
          <div class="chat-window-header row-between">
            <div>
              <div style="font-weight:900" id="chat-title">Select a conversation</div>
              <div class="small text-muted mt-1" id="chat-subtitle">Typing indicator, seen status, and presence are live.</div>
            </div>
            <span class="badge dark" id="presence-pill">Offline</span>
          </div>
          <div class="chat-messages" id="chat-messages">${Utils.emptyState('📭', 'No conversation selected', 'Pick a chat or start a new one.')}</div>
          <div class="chat-window-footer">
            <form id="chat-form" class="row-between" style="gap:10px">
              <input id="chat-input" class="input" placeholder="Type your message" disabled />
              <button class="btn btn-primary" id="chat-send" disabled data-i18n="chat.send">Send</button>
            </form>
          </div>
        </section>
      </div>
      <div class="modal-backdrop" id="chat-modal">
        <div class="modal">
          <div class="row-between"><h3 class="mt-0">Start a new chat</h3><button class="btn btn-ghost" id="close-chat-modal">✕</button></div>
          <input class="input mt-2" id="chat-search" placeholder="Search by username or sport" />
          <div id="chat-search-results" class="card-list mt-3"></div>
        </div>
      </div>
    `;

    unlistenConversations?.();
    unlistenConversations = DB.listenConversations(currentUser.uid, (rows) => {
      const list = document.getElementById('conversation-list');
      list.innerHTML = rows.length ? rows.map((row) => conversationRow(row, currentUser)).join('') : Utils.emptyState('🗨️', 'No chats yet', 'Start with a club, player, or scout.');
      list.querySelectorAll('.chat-item').forEach((item) => {
        item.addEventListener('click', () => {
          openConversation({
            id: item.dataset.conversation,
            otherUid: item.dataset.otherUid,
            otherName: item.dataset.otherName
          }, currentUser);
        });
      });
    });

    document.getElementById('chat-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!activeConversation || !activeReceiver || !text) return;
      try {
        await DB.sendMessage(activeConversation, currentUser, activeReceiver, text);
        input.value = '';
        await DB.setTyping(activeConversation, currentUser.uid, false);
      } catch (error) {
        Utils.toast('error', 'Message failed', error.message || 'Unable to send message.');
      }
    });

    document.getElementById('chat-input').addEventListener('input', Utils.debounce(async (event) => {
      if (activeConversation) await DB.setTyping(activeConversation, currentUser.uid, !!event.target.value.trim());
    }, 180));

    document.getElementById('new-chat-btn').addEventListener('click', () => document.getElementById('chat-modal').classList.add('show'));
    document.getElementById('close-chat-modal').addEventListener('click', () => document.getElementById('chat-modal').classList.remove('show'));
    document.getElementById('chat-search').addEventListener('input', Utils.debounce(async (event) => {
      const query = event.target.value.toLowerCase().trim();
      const results = document.getElementById('chat-search-results');
      const users = (await DB.listUsers({})).filter((row) => row.uid !== currentUser.uid && (!query || row.username.toLowerCase().includes(query) || (row.sport || '').toLowerCase().includes(query)));
      results.innerHTML = users.length ? users.slice(0, 12).map((row) => `
        <div class="transfer-card row-between">
          <div><strong>${Utils.escapeHTML(row.username)}</strong><div class="small text-muted mt-1">${App.sportLabel(row.sport)} • ${row.role}</div></div>
          <button class="btn btn-primary btn-sm" data-open-user="${row.uid}" data-open-name="${Utils.escapeHTML(row.username)}">Open</button>
        </div>
      `).join('') : Utils.emptyState('🔎', 'No users found', 'Try another search.');
      results.querySelectorAll('[data-open-user]').forEach((button) => {
        button.addEventListener('click', async () => {
          const receiver = users.find((entry) => entry.uid === button.dataset.openUser);
          const conversationId = await DB.getConversationId(currentUser.uid, receiver.uid, { memberNames: [currentUser.username, receiver.username] });
          document.getElementById('chat-modal').classList.remove('show');
          openConversation({ id: conversationId, otherUid: receiver.uid, otherName: receiver.username }, currentUser);
        });
      });
    }, 220));
  }

  function openConversation(payload, currentUser) {
    activeConversation = payload.id;
    activeReceiver = { uid: payload.otherUid, username: payload.otherName };
    document.getElementById('chat-title').textContent = payload.otherName;
    document.getElementById('chat-subtitle').textContent = 'Typing and seen status update automatically.';
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-send').disabled = false;
    document.getElementById('presence-pill').textContent = 'Online';
    document.querySelectorAll('.chat-item').forEach((item) => item.classList.toggle('active', item.dataset.conversation === payload.id));
    unlistenMessages?.();
    unlistenMessages = DB.listenMessages(payload.id, async (messages) => {
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.innerHTML = messages.length ? messages.map((message) => messageBubble(message, currentUser)).join('') : Utils.emptyState('✉️', 'No messages yet', 'Say hello and break the ice.');
      
      // Better autoscroll logic
      requestAnimationFrame(() => {
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
      });

      await DB.setSeen(payload.id, currentUser.uid);
    });
  }

  return { mount, openConversation };
})();
