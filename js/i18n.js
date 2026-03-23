import { renderLanguageOptions, LANGUAGE_OPTIONS } from './utils.js';

let translations = {};
let currentLanguage = localStorage.getItem('scoutme_language') || 'en';

const deepGet = (object, path) => path.split('.').reduce((acc, key) => acc?.[key], object);

export const getCurrentLanguage = () => currentLanguage;
export const isRTL = (lang = currentLanguage) => lang === 'ar';

export const t = (key, fallback = '') => deepGet(translations, key) || fallback || key;

export const loadLanguage = async (lang = 'en') => {
  const selected = LANGUAGE_OPTIONS.some((item) => item.code === lang) ? lang : 'en';
  const response = await fetch(new URL(`../assets/lang/${selected}.json`, import.meta.url));
  translations = await response.json();
  currentLanguage = selected;
  localStorage.setItem('scoutme_language', selected);
  document.documentElement.lang = selected;
  document.documentElement.dir = selected === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', selected === 'ar');
  applyTranslations();
  return translations;
};

export const applyTranslations = (root = document) => {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    const translated = t(key, node.textContent.trim());
    if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
      node.placeholder = translated;
    } else {
      node.textContent = translated;
    }
  });

  root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder, node.placeholder || '');
  });
};

export const setupLanguageSwitcher = (select, onChange) => {
  if (!select) return;
  renderLanguageOptions(select, currentLanguage);
  select.addEventListener('change', async (event) => {
    const lang = event.target.value;
    await loadLanguage(lang);
    onChange?.(lang);
  });
};
