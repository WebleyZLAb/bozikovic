const WA_NUMBER = '385955739367';

const WA_MESSAGES = {
  hr: {
    studio: `Pozdrav! Zanima me Studio apartman (2 osobe). Možete li mi reći je li slobodan u terminu: ...`,
    a3: `Pozdrav! Zanima me Apartman A3 (3 osobe). Možete li mi reći je li slobodan u terminu: ...`,
    a4: `Pozdrav! Zanima me Apartman A4+2 (do 6 osoba). Možete li mi reći je li slobodan u terminu: ...`,
  },
  en: {
    studio: `Hello! I'm interested in the Studio apartment (2 persons). Is it available for: ...`,
    a3: `Hello! I'm interested in Apartment A3 (3 persons). Is it available for: ...`,
    a4: `Hello! I'm interested in Apartment A4+2 (up to 6 persons). Is it available for: ...`,
  },
};

let translations = {};
let currentLang = 'hr';

export async function initI18n() {
  const saved = localStorage.getItem('lang');
  const preferred = saved || (navigator.language?.startsWith('en') ? 'en' : 'hr');
  await setLang(preferred, false);
  bindToggle();
}

async function loadTranslations(lang) {
  const res = await fetch(`/src/locales/${lang}.json`);
  return res.json();
}

export async function setLang(lang, save = true) {
  if (lang !== 'hr' && lang !== 'en') lang = 'hr';
  currentLang = lang;
  translations = await loadTranslations(lang);
  if (save) localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  applyTranslations();
  updateToggleUI(lang);
  updateWALinks(lang);
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(translations, key);
    if (value !== undefined) el.textContent = value;
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, k) => acc?.[k], obj);
}

function updateToggleUI(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

export function updateWALinks(lang) {
  const msgs = WA_MESSAGES[lang] || WA_MESSAGES.hr;
  document.querySelectorAll('[data-wa-apartment]').forEach(el => {
    const apt = el.dataset.waApartment;
    const msg = msgs[apt] || msgs.studio;
    el.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  });
}

function bindToggle() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

export function getCurrentLang() {
  return currentLang;
}
