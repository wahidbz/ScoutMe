window.Utils = (() => {
  const STORAGE = {
    session: "scoutme.session",
    locale: "scoutme.locale",
    seeded: "scoutme.seeded",
    onboarding: "scoutme.onboarding.done"
  };

  function $(selector, scope = document) { return scope.querySelector(selector); }
  function $$(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }
  function escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function slug(value = "") {
    return String(value).toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06ff\u4e00-\u9fff\u3040-\u30ff\u0900-\u097f]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function clamp(num, min, max) { return Math.min(Math.max(num, min), max); }
  function formatNumber(value = 0) { return Number(value || 0).toLocaleString(); }
  function setSession(data) { localStorage.setItem(STORAGE.session, JSON.stringify(data)); }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE.session) || "null"); } catch (_) { return null; }
  }
  function clearSession() { localStorage.removeItem(STORAGE.session); }
  function saveLocale(locale) { localStorage.setItem(STORAGE.locale, locale); }
  function getLocale() { return localStorage.getItem(STORAGE.locale) || "en"; }
  function setSeeded() { sessionStorage.setItem(STORAGE.seeded, "1"); }
  function isSeeded() { return sessionStorage.getItem(STORAGE.seeded) === "1"; }
  function markOnboardingDone() { localStorage.setItem(STORAGE.onboarding, "1"); }
  function onboardingDone() { return localStorage.getItem(STORAGE.onboarding) === "1"; }

  function toast(type = "info", title = "ScoutMe", message = "") {
    let wrap = $("#toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "toast-wrap";
      wrap.className = "toast-wrap";
      document.body.appendChild(wrap);
    }
    const iconMap = {
      success: "check-circle",
      error: "alert-octagon",
      warning: "alert-triangle",
      info: "info"
    };
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `
      <div class="row-between" style="align-items:flex-start;gap:12px">
        <i data-lucide="${iconMap[type] || "info"}" class="toast-icon"></i>
        <div style="flex:1">
          <div class="toast-title">${escapeHTML(title)}</div>
          <div class="small text-muted" style="color:rgba(255,255,255,0.7)">${escapeHTML(message)}</div>
        </div>
      </div>
    `;
    wrap.appendChild(el);
    if (window.lucide) lucide.createIcons();
    
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-8px)";
      setTimeout(() => el.remove(), 250);
    }, 4500);
  }

  function handleError(error, context = "Error") {
    console.error(`[ScoutMe] ${context}:`, error);
    hideLoader();
    toast("error", context, error.message || "An unexpected error occurred.");
  }

  function showLoader(text = "Loading…") {
    let loader = $("#loader-screen");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "loader-screen";
      loader.className = "loader-screen";
      loader.innerHTML = `<div class="spinner"></div><div class="text-muted" id="loader-text"></div>`;
      document.body.appendChild(loader);
    }
    const textNode = $("#loader-text", loader);
    if (textNode) textNode.textContent = text;
    loader.classList.add("show");
  }

  function hideLoader() {
    const loader = $("#loader-screen");
    if (loader) loader.classList.remove("show");
  }

  function timeAgo(input) {
    const date = toDate(input);
    if (!date) return "--";
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function toDate(input) {
    if (!input) return null;
    if (input instanceof Date) return input;
    if (typeof input.toDate === "function") return input.toDate();
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(input, locale = getLocale()) {
    const date = toDate(input);
    if (!date) return "--";
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(date);
  }

  function debounce(fn, wait = 250) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function computeScore(payload = {}) {
    const skills = Number(payload.skills || 0);
    const activity = Number(payload.activity || 0);
    const reviews = Number(payload.reviews || 0);
    const videos = Number(payload.videos || 0);
    return Math.round((skills * 0.4) + (activity * 0.2) + (reviews * 0.2) + (videos * 0.2));
  }

  function initials(name = "ScoutMe") {
    return String(name).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function setActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    $$(".nav-link[data-page], .bottom-nav-item[data-page]").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === path);
    });
  }

  function sidebarToggle() {
    const sidebar = $("#sidebar");
    const overlay = $("#sidebar-overlay");
    const openSidebar = () => {
      sidebar?.classList.add("open");
      overlay?.classList.add("show");
    };
    $("#sidebar-toggle")?.addEventListener("click", openSidebar);
    $("#bottom-menu-toggle")?.addEventListener("click", openSidebar);
    overlay?.addEventListener("click", () => {
      sidebar?.classList.remove("open");
      overlay.classList.remove("show");
    });
  }

  function ringHTML(score = 0) {
    const ratio = clamp((Number(score) || 0) / 100, 0, 1);
    return `<div class="score-ring" style="--score:${ratio}"><strong>${Math.round(score || 0)}</strong></div>`;
  }

  function weekChartHTML(values = []) {
    const max = Math.max(...values.map((item) => item.value), 1);
    return `<div class="week-chart">${values.map((item) => {
      const height = Math.max(16, Math.round((item.value / max) * 140));
      return `<div class="week-bar"><span>${escapeHTML(item.day)}</span><div class="bar" style="height:${height}px"></div><strong class="small">${item.value}</strong></div>`;
    }).join("")}</div>`;
  }

  function getEmbedHTML(url = "") {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
        const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
        if (!id) return "";
        return `<iframe class="video-frame" loading="lazy" allowfullscreen src="https://www.youtube.com/embed/${id}"></iframe>`;
      }
      if (parsed.hostname.includes("tiktok.com")) {
        return `<iframe class="video-frame" loading="lazy" src="${escapeHTML(url)}"></iframe>`;
      }
    } catch (_) {
      return "";
    }
    return "";
  }

  function copyText(text, successMessage = "Copied") {
    return navigator.clipboard.writeText(text).then(() => toast("success", "ScoutMe", successMessage));
  }

  function emptyState(icon, title, message) {
    return `<div class="empty-state"><div style="font-size:2rem">${icon}</div><div style="font-weight:800;margin-top:8px">${escapeHTML(title)}</div><div class="small text-muted mt-1">${escapeHTML(message)}</div></div>`;
  }

  function randomWeeklyValues() {
    return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => ({ day, value: randomInt(4, 18) }));
  }

  return {
    STORAGE,
    $, $$,
    escapeHTML,
    slug,
    uid,
    randomInt,
    clamp,
    formatNumber,
    setSession,
    getSession,
    clearSession,
    saveLocale,
    getLocale,
    setSeeded,
    isSeeded,
    markOnboardingDone,
    onboardingDone,
    toast,
    showLoader,
    hideLoader,
    timeAgo,
    toDate,
    formatDate,
    debounce,
    computeScore,
    initials,
    setActiveNav,
    sidebarToggle,
    ringHTML,
    weekChartHTML,
    getEmbedHTML,
    copyText,
    emptyState,
    randomWeeklyValues
  };
})();
