import { auth } from './firebase.js';
import { listenAllUsers, listenMessages, listenTyping, markConversationSeen, sendMessage, setTypingState } from './database.js';
import { formatRelative, getInitials, q, slugConversation, toast } from './utils.js';
import { t, applyTranslations } from './i18n.js';

export const initChatPage = async ({ currentProfile }) => {
  const root = q('#page-root');
  root.innerHTML = `
    <div class="chat-layout">
      <aside class="glass-card">
        <h3>${t('chat.contacts', 'Contacts')}</h3>
        <div id="chat-users" class="chat-users"></div>
      </aside>
      <section class="glass-card chat-thread">
        <div id="chat-header" class="page-header" style="margin-bottom:0;"></div>
        <div id="typing-indicator" class="muted"></div>
        <div id="chat-messages" class="chat-messages"></div>
        <form id="chat-form" class="chat-input-row">
          <input id="chat-text" class="input" data-i18n-placeholder="chat.placeholder" placeholder="Type your message" />
          <button class="btn btn-green" type="submit">${t('chat.send', 'Send')}</button>
        </form>
      </section>
    </div>
  `;
  applyTranslations(root);

  const requestedUserId = new URLSearchParams(location.search).get('uid');
  let users = [];
  let activeUser = null;
  let unlistenMessages = () => null;
  let unlistenTyping = () => null;
  const chatUsers = q('#chat-users');
  const chatHeader = q('#chat-header');
  const chatMessages = q('#chat-messages');
  const typingIndicator = q('#typing-indicator');
  const textInput = q('#chat-text');

  const renderUsers = () => {
    chatUsers.innerHTML = users.filter((user) => user.uid !== currentProfile.uid).map((user) => `
      <article class="chat-user-item ${activeUser?.uid === user.uid ? 'active' : ''}" data-user="${user.uid}">
        <div class="inline-actions" style="justify-content:space-between;">
          <div class="inline-actions"><span class="avatar">${getInitials(user.username)}</span><div><strong>${user.username}</strong><div class="muted">${user.sport} · ${user.online ? t('chat.online', 'Online') : t('chat.offline', 'Offline')}</div></div></div>
        </div>
      </article>`).join('');
    root.querySelectorAll('[data-user]').forEach((item) => item.addEventListener('click', () => openConversation(item.dataset.user)));
  };

  const openConversation = (uid) => {
    activeUser = users.find((user) => user.uid === uid);
    renderUsers();
    if (!activeUser) return;
    chatHeader.innerHTML = `<div><h3>${activeUser.username}</h3><p class="muted">${activeUser.sport} · ${activeUser.country || 'Global'}</p></div>`;
    const conversationId = slugConversation(currentProfile.uid, activeUser.uid);
    unlistenMessages();
    unlistenTyping();
    unlistenMessages = listenMessages(conversationId, async (messages) => {
      chatMessages.innerHTML = messages.map((message) => `
        <article class="message ${message.senderId === currentProfile.uid ? 'me' : ''}">
          <div>${message.text}</div>
          <div class="message-meta">${formatRelative(message.timestamp)} · ${message.seen ? t('chat.seen', 'Seen') : t('chat.sent', 'Sent')}</div>
        </article>`).join('');
      chatMessages.scrollTop = chatMessages.scrollHeight;
      await markConversationSeen(conversationId, currentProfile.uid);
    });
    unlistenTyping = listenTyping(conversationId, (rows) => {
      const activeTyping = rows.find((row) => row.uid === activeUser.uid && row.state);
      typingIndicator.textContent = activeTyping ? `${activeUser.username} ${t('chat.typing', 'is typing...')}` : '';
    });
  };

  q('#chat-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeUser) return toast('Select a contact first.', 'error');
    const text = textInput.value.trim();
    if (!text) return;
    await sendMessage({ senderId: currentProfile.uid, receiverId: activeUser.uid, text });
    await setTypingState(slugConversation(currentProfile.uid, activeUser.uid), currentProfile.uid, false, activeUser.uid);
    textInput.value = '';
  });

  textInput.addEventListener('input', async () => {
    if (!activeUser) return;
    const conversationId = slugConversation(currentProfile.uid, activeUser.uid);
    await setTypingState(conversationId, currentProfile.uid, Boolean(textInput.value.trim()), activeUser.uid);
  });

  listenAllUsers((payload) => {
    users = payload;
    renderUsers();
    const preferred = users.find((user) => user.uid === requestedUserId && user.uid !== currentProfile.uid);
    const fallback = users.find((user) => user.uid !== currentProfile.uid);
    if (!activeUser && (preferred || fallback)) {
      openConversation((preferred || fallback).uid);
    }
  });
};
