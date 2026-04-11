window.I18n = (() => {
  const LANGS = {
    en: { label: "English", dir: "ltr" },
    ar: { label: "العربية", dir: "rtl" },
    fr: { label: "Français", dir: "ltr" },
    es: { label: "Español", dir: "ltr" },
    pt: { label: "Português", dir: "ltr" },
    de: { label: "Deutsch", dir: "ltr" },
    it: { label: "Italiano", dir: "ltr" },
    tr: { label: "Türkçe", dir: "ltr" },
    hi: { label: "हिन्दी", dir: "ltr" },
    zh: { label: "中文", dir: "ltr" },
    ja: { label: "日本語", dir: "ltr" }
  };

  let dictionary = {};
  let currentLocale = Utils.getLocale();

  async function load(locale = "en") {
    const safeLocale = LANGS[locale] ? locale : "en";
    const response = await fetch(`assets/lang/${safeLocale}.json`);
    dictionary = await response.json();
    currentLocale = safeLocale;
    Utils.saveLocale(safeLocale);
    applyDirection(safeLocale);
    translateDOM();
    syncLanguageSwitcher();
    return dictionary;
  }

  function t(key, fallback = "") {
    return (key.split(".").reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), dictionary) ?? fallback) || key;
  }

  function translateDOM(scope = document) {
    Utils.$$('[data-i18n]', scope).forEach((node) => {
      node.textContent = t(node.dataset.i18n, node.textContent || "");
    });
    Utils.$$('[data-i18n-placeholder]', scope).forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder, node.getAttribute("placeholder") || ""));
    });
    document.documentElement.lang = currentLocale;
  }

  function applyDirection(locale) {
    const dir = (LANGS[locale] || LANGS.en).dir;
    document.documentElement.setAttribute("dir", dir);
    document.body.setAttribute("data-dir", dir);
  }

  function syncLanguageSwitcher() {
    Utils.$$("[data-language-select]").forEach((select) => {
      select.value = currentLocale;
    });
  }

  async function init(defaultLocale) {
    const locale = defaultLocale || Utils.getLocale() || "en";
    return load(locale);
  }

  function optionsHTML() {
    return Object.entries(LANGS).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join("");
  }

  async function handleChange(nextLocale, currentUser) {
    await load(nextLocale);
    if (currentUser && window.DB) {
      await DB.updateUser(currentUser.uid, { language: nextLocale });
    }
  }

  function showModal() {
    let modal = document.getElementById('i18n-lang-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'i18n-lang-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal glass" style="max-width:400px; width:90%;">
          <div class="row-between mb-3"><h3 class="mt-0">&#127760; Select Language</h3><button class="btn btn-ghost" onclick="document.getElementById('i18n-lang-modal').classList.remove('show')">&#10006;</button></div>
          <div class="grid-2">
            ${Object.entries(LANGS).map(([key, value]) => `
              <button class="btn ${key === currentLocale ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="I18n.handleModalSelect('${key}')" style="justify-content:center;">
                ${value.label}
              </button>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      const buttons = modal.querySelectorAll('.grid-2 button');
      Object.keys(LANGS).forEach((key, index) => {
        buttons[index].className = `btn ${key === currentLocale ? 'btn-primary' : 'btn-secondary'} btn-sm`;
      });
    }
    setTimeout(() => modal.classList.add('show'), 10);
  }

  async function handleModalSelect(key) {
    document.getElementById('i18n-lang-modal').classList.remove('show');
    if (key !== currentLocale) {
      let user = null;
      // Try to sync with Firestore if user is active
      if (window.DB && window.Auth?.currentUser) {
        user = window.Auth.currentUser; 
      }
      await handleChange(key, user);
      syncLanguageSwitcher();
    }
  }

  return {
    LANGS,
    init,
    load,
    t,
    translateDOM,
    applyDirection,
    optionsHTML,
    handleChange,
    showModal,
    handleModalSelect,
    getCurrentLocale: () => currentLocale
  };
})();
