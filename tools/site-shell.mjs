#!/usr/bin/env node
/*
 * Site shell — single source of truth for the header / mobile drawer / footer
 * that every real page (EN root + /es/) shares. Consumed by apply-nav.mjs
 * (top-level static pages) and build-hire-pages.mjs (services hub + 6 hire
 * pages) so the nav can never drift between generators again.
 *
 * Canon (mirrors index.html EN / es/index.html ES):
 *   nav: Home/Inicio · Clients/Clientes · 1:1 · Services/Servicios ·
 *        About me/Sobre mí (index.html#about) · Blog
 *   CTA: Book a call / Reservar una llamada
 *   lang-switch: US · CO · RU (current language marked active)
 */

export const WA = 'https://wa.me/573507402009';

const EN_NAV = [
  ['index.html', 'Home'],
  ['clients.html', 'Clients'],
  ['sessions.html', '1:1'],
  ['services.html', 'Services'],
  ['index.html#about', 'About me'],
  ['blog.html', 'Blog']
];
const ES_NAV = [
  ['index.html', 'Inicio'],
  ['clients.html', 'Clientes'],
  ['sesiones.html', '1:1'],
  ['services.html', 'Servicios'],
  ['index.html#about', 'Sobre mí'],
  ['blog.html', 'Blog']
];

export const NAV = { en: EN_NAV, es: ES_NAV };

/* Favicon links — asset is the per-page relative assets prefix
   ('assets' at the root, '../assets' in /es/, '../../assets' in nested dirs). */
export function faviconHTML(asset) {
  return (
    '  <link rel="icon" href="' + asset + '/favicon.svg" type="image/svg+xml" />\n' +
    '  <link rel="icon" href="' + asset + '/favicon.ico" sizes="any" />\n' +
    '  <link rel="apple-touch-icon" href="' + asset + '/apple-touch-icon.png" />'
  );
}

/* Basenames that differ across languages (EN ↔ ES). */
const ALT_PAGE = {
  'sessions.html': 'sesiones.html',
  'sesiones.html': 'sessions.html'
};

/* Page basename -> cross-language absolute URL ('' = language index). */
export function otherLangHref(lang, page) {
  const base = lang === 'en' ? '/es/' : '/';
  let name = page && page !== 'index.html' ? page : '';
  if (name) name = ALT_PAGE[name] || name;
  return base + name;
}

function flag(asset, lang, current, label, iso, title, isActive) {
  if (isActive) {
    return (
      '            <span class="flag is-active" title="' + title + '"><img src="' + asset + '/img/flags/' +
      iso + '.svg" alt="' + label + '" width="24" height="16" loading="lazy" /><span class="visually-hidden">' +
      label + '</span></span>'
    );
  }
  const href = lang === 'en'
    ? (iso === 'co' ? otherLangHref(lang, current === 'index.html' ? null : current) : '/')
    : (iso === 'us' ? otherLangHref(lang, current === 'index.html' ? null : current) : '/');
  return (
    '            <a class="flag lang-flag" href="' + href + '" hreflang="' + iso + '" lang="' + iso +
    '" data-lang="' + iso + '" title="' + title + '"><img src="' + asset + '/img/flags/' + iso +
    '.svg" alt="' + label + '" width="24" height="16" loading="lazy" /><span class="visually-hidden">' +
    label + '</span></a>'
  );
}

function desktopLinks(nav, active) {
  return nav
    .map(([href, label]) => '          <a href="' + href + '"' + (href === active ? ' aria-current="page"' : '') + '>' + label + '</a>')
    .join('\n');
}
function drawerLinks(nav) {
  return nav.map(([href, label]) => '    <a href="' + href + '">' + label + '</a>').join('\n');
}
function footerLinks(nav) {
  return nav.map(([href, label]) => '            <li><a href="' + href + '">' + label + '</a></li>').join('\n');
}
function arrow() {
  return '<svg class="arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* lang: 'en' | 'es'
   active: nav item marked aria-current ('index.html', 'services.html', …)
   page:   current file basename, used for the cross-language flag link. */
export function headerHTML(lang, active, page) {
  const A = lang === 'en' ? 'assets' : '../assets';
  const nav = NAV[lang];
  const cur = page || active || 'index.html';
  const isEs = lang === 'es';
  return (
    '  <header class="site-header">\n' +
    '    <div class="container container--wide">\n' +
    '      <nav class="nav" aria-label="' + (isEs ? 'Principal' : 'Primary') + '">\n' +
    '        <a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true"></span> SoyJacquesHauzeur</a>\n' +
    '        <div class="nav-links" role="navigation">\n' +
    desktopLinks(nav, active) + '\n' +
    '        </div>\n' +
    '        <div class="nav-cta-row">\n' +
    '          <a href="' + WA + '" target="_blank" rel="noopener" class="btn btn--primary btn--sm">' + (isEs ? 'Reservar una llamada' : 'Book a call') + '\n' +
    '            ' + arrow() + '\n' +
    '          </a>\n' +
    '          <nav class="lang-switch" aria-label="' + (isEs ? 'Idioma' : 'Language') + '">\n' +
    flag(A, lang, cur, 'English', 'us', 'English', lang === 'en') + '\n' +
    flag(A, lang, cur, 'Español', 'co', 'Español', lang === 'es') + '\n' +
    flag(A, lang, cur, 'Русский', 'ru', 'Русский', false) + '\n' +
    '          </nav>\n' +
    '          <button class="nav-toggle" aria-label="' + (isEs ? 'Abrir menú' : 'Open menu') + '" aria-expanded="false" aria-controls="mobile-drawer"><span aria-hidden="true"></span></button>\n' +
    '        </div>\n' +
    '      </nav>\n' +
    '    </div>\n' +
    '  </header>'
  );
}

export function drawerHTML(lang, page) {
  const A = lang === 'en' ? 'assets' : '../assets';
  const nav = NAV[lang];
  const cur = page || 'index.html';
  const isEs = lang === 'es';
  return (
    '  <div class="mobile-drawer" id="mobile-drawer" aria-hidden="true">\n' +
    '    <button class="drawer-close" aria-label="' + (isEs ? 'Cerrar menú' : 'Close menu') + '">' + (isEs ? 'Cerrar' : 'Close') + '</button>\n' +
    drawerLinks(nav) + '\n' +
    '    <div class="lang-switch" aria-label="' + (isEs ? 'Idioma' : 'Language') + '">\n' +
    '      <span class="lang-label">' + (isEs ? 'Idioma' : 'Language') + '</span>\n' +
    flag(A, lang, cur, 'English', 'us', 'English', lang === 'en') + '\n' +
    flag(A, lang, cur, 'Español', 'co', 'Español', lang === 'es') + '\n' +
    flag(A, lang, cur, 'Русский', 'ru', 'Русский', false) + '\n' +
    '    </div>\n' +
    '  </div>'
  );
}

export function footerHTML(lang) {
  const isEs = lang === 'es';
  const brand = isEs
    ? '<p>Educación en tecnología y web y marketing llave en mano para fundadores, equipos y empresas — hechos para entregarte, no para tenerte de rehén.</p>\n          <span class="label">Enseño · construyo · acompaño · en todo el mundo</span>'
    : '<p>Technology education and done-for-you web &amp; marketing for founders, teams and companies — built to hand over, not to hold hostage.</p>\n          <span class="label">Teaching · building · mentoring · worldwide</span>';
  return (
    '  <footer class="site-footer">\n' +
    '    <div class="container container--wide">\n' +
    '      <div class="footer-top footer-top--minimal">\n' +
    '        <div class="footer-brand">\n' +
    '          <span class="brand"><span class="brand-mark" aria-hidden="true"></span> Jacques Hauzeur</span>\n' +
    '          ' + brand + '\n' +
    '        </div>\n' +
    '        <div>\n' +
    '          <h4>' + (isEs ? 'Explorar' : 'Explore') + '</h4>\n' +
    '          <ul>\n' +
    footerLinks(NAV[lang]) + '\n' +
    '          </ul>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="footer-bottom">\n' +
    '        <span class="footer-copy"><span class="ft-sign">©</span> <span class="ft-year">2026</span> <span class="ft-month"></span> <span class="ft-code">&lt;/&gt;</span> Jacques Hauzeur · SoyJacquesHauzeur</span>\n' +
    '        <div class="footer-meta-links">\n' +
    (isEs
      ? '          <a href="#">Privacidad</a>\n          <a href="#">Aviso legal</a>\n          <a href="#">Mapa del sitio</a>\n'
      : '          <a href="#">Privacy</a>\n          <a href="#">Imprint</a>\n          <a href="#">Sitemap</a>\n') +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </footer>'
  );
}
