#!/usr/bin/env node
/*
 * Locale registry — SINGLE SOURCE OF TRUTH for every language dimension the
 * generators need: output directory, relative asset prefix, site base path,
 * hreflang/flag identity, data-file suffix, and the per-language nav / footer
 * copy. Consumed by site-shell.mjs, apply-nav.mjs, apply-favicons.mjs,
 * build-hire-pages.mjs, build-contract-pages.mjs, i18n-sync-check.mjs and
 * new-post.mjs so no tool ever hardcodes `lang === 'es'` or a path prefix again.
 *
 * Convention: EN lives at the site root (dir '', base '/'), other languages in
 * their own subdirectory ('es/', 'ru/'). A locale is `available` only once its
 * `/es/`, `/ru/` tree exists; unavailable locales still appear in the language
 * switch (pointing at the default language root) but are never generated.
 */

export const DEFAULT_LANG = 'en';

/* All switch flags, in render order (us · co · ru). */
export const LANG_ORDER = ['en', 'es', 'ru'];

/* Basenames that differ across languages (EN ↔ ES). */
export const PAGE_ALIASES = {
  'sessions.html': 'sesiones.html',
  'sesiones.html': 'sessions.html'
};

/* Filenames that differ per language (page-level, not just locale-level). */
export const LANG_FILES = {
  contract: { en: 'contract.html', es: 'contrato.html', ru: 'contract.html' }
};

export const LOCALES = {
  en: {
    key: 'en',
    htmlLang: 'en',
    dir: '',                 // output directory relative to repo root
    asset: 'assets',         // assets prefix from a top-level page of this locale
    base: '/',               // site-absolute base for cross-language links
    hreflang: 'en',
    flag: 'us',              // flag svg basename (also used by the existing swtich markup)
    flagLabel: 'English',
    flagTitle: 'English',
    available: true,
    dataSuffix: '',          // hire-data{}.js / contract-data{}.js
    terms: false,            // loads assets/js/terms.js
    skip: 'Skip to content',
    navAria: 'Primary',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    menuCloseShort: 'Close',
    cta: 'Book a video call',
    langLabel: 'Language',
    footerExplore: 'Explore',
    footerBrand:
      '<p>To me, marketing is quantum: the result exists in superposition until you measure it. I build the measuring device — web, campaigns and automation — so it collapses in your favour. No lock-in, no hype.</p>\n          <span class="label">Teaching · building · mentoring · worldwide</span>',
    footerMeta: ['Privacy', 'Imprint', 'Sitemap'],
    nav: [
      ['index.html', 'Home'],
      ['clients.html', 'Clients'],
      ['sessions.html', '1:1'],
      ['services.html', 'Services'],
      ['index.html#about', 'About me'],
      ['blog.html', 'Blog']
    ]
  },

  es: {
    key: 'es',
    htmlLang: 'es',
    dir: 'es/',
    asset: '../assets',
    base: '/es/',
    hreflang: 'es',
    flag: 'co',
    flagLabel: 'Español',
    flagTitle: 'Español',
    available: true,
    dataSuffix: '-es',
    terms: true,
    skip: 'Saltar al contenido',
    navAria: 'Principal',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    menuCloseShort: 'Cerrar',
    cta: 'Agenda video-llamada',
    langLabel: 'Idioma',
    footerExplore: 'Explorar',
    footerBrand:
      '<p>El marketing, para mí, es cuántico: el resultado existe en superposición hasta que lo mides. Yo construyo el aparato de medición — web, campañas y automatización — para que colapse a tu favor. Sin permanencia, sin humo.</p>\n          <span class="label">Enseño · construyo · acompaño · en todo el mundo</span>',
    footerMeta: ['Privacidad', 'Aviso legal', 'Mapa del sitio'],
    nav: [
      ['index.html', 'Inicio'],
      ['clients.html', 'Clientes'],
      ['sesiones.html', '1:1'],
      ['services.html', 'Servicios'],
      ['index.html#about', 'Sobre mí'],
      ['blog.html', 'Blog']
    ]
  },

  /*
   * RU — NOT BUILT YET. Structural fields + switch flag are wired so the
   * language switcher can render it today (it points at the default root while
   * unavailable). Copy (nav / footer / data) is intentionally left out and must
   * be added — and `available` flipped to true — when /ru/ is created.
   */
  ru: {
    key: 'ru',
    htmlLang: 'ru',
    dir: 'ru/',
    asset: '../assets',
    base: '/ru/',
    hreflang: 'ru',
    flag: 'ru',
    flagLabel: 'Русский',
    flagTitle: 'Русский',
    available: false,
    dataSuffix: '-ru',
    terms: false
  }
};

export function locale(lang) {
  return LOCALES[lang] || LOCALES[DEFAULT_LANG];
}

/* Locale keys that are live and generate pages, in switch order. */
export function availableLangs() {
  return LANG_ORDER.filter((k) => LOCALES[k].available);
}

/* Locale key for a repo-relative path ('index.html', 'es/blog/x.html'). */
export function langForPath(path) {
  const clean = String(path).replace(/^\.\//, '').replace(/^\/+/, '');
  for (const k of LANG_ORDER) {
    const d = LOCALES[k].dir;
    if (d && clean.startsWith(d)) return k;
  }
  return DEFAULT_LANG;
}

/* Assets prefix for a page `depth` levels below the locale root. */
export function assetPrefix(lang, depth = 0) {
  return '../'.repeat(depth) + locale(lang).asset;
}

/* Site-absolute href to `page`'s counterpart in `toLang` ('' = locale index). */
export function otherLangHref(toLang, page) {
  const t = locale(toLang);
  if (!t.available) return locale(DEFAULT_LANG).base;
  const name = page && page !== 'index.html' ? (PAGE_ALIASES[page] || page) : '';
  return t.base + name;
}
