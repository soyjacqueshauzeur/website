#!/usr/bin/env node
/*
 * Site shell — single source of truth for the header / mobile drawer / footer
 * that every real page (EN root + /es/) shares. Consumed by apply-nav.mjs
 * (top-level static pages) and build-hire-pages.mjs (services hub + 6 hire
 * pages) so the nav can never drift between generators again.
 *
 * All language dimensions (dirs, asset prefix, cross-language links, nav and
 * footer copy) come from tools/locales.mjs — this file no longer branches on
 * `lang === 'es'`.
 */

import { LOCALES, LANG_ORDER, locale, otherLangHref } from './locales.mjs';

export const WA = 'https://wa.me/573507402009';
/* Booking link (Google Meet agenda) — main "Book a call" CTA */
export const CAL = 'https://calendar.app.google/DyS8yXtsb85ZD7kJ7';

/* Per-language nav is the registry's `nav` (single source for header/footer). */
export const NAV = Object.fromEntries(
  Object.entries(LOCALES).map(([k, l]) => [k, l.nav])
);

/* Favicon links — asset is the per-page relative assets prefix
   ('assets' at the root, '../assets' in /es/, '../../assets' in nested dirs). */
export function faviconHTML(asset) {
  return (
    '  <link rel="icon" href="' + asset + '/favicon.svg" type="image/svg+xml" />\n' +
    '  <link rel="icon" href="' + asset + '/favicon.ico" sizes="any" />\n' +
    '  <link rel="apple-touch-icon" href="' + asset + '/apple-touch-icon.png" />'
  );
}

/* Cross-language href for `page` (kept public for other generators). */
export { otherLangHref };

/* One flag of the language switch, driven by the registry. */
function flag(asset, lang, page, targetLang) {
  const t = locale(targetLang);
  const iso = t.flag;
  const label = t.flagLabel;
  const title = t.flagTitle;

  if (targetLang === lang) {
    return (
      '            <span class="flag is-active" title="' + title + '"><img src="' + asset + '/img/flags/' +
      iso + '.svg" alt="' + label + '" width="24" height="16" loading="lazy" /><span class="visually-hidden">' +
      label + '</span></span>'
    );
  }

  const href = otherLangHref(targetLang, page === 'index.html' ? null : page);
  const code = t.hreflang; // 'en' | 'es' | 'ru' (valid hreflang/lang/data-lang)
  return (
    '            <a class="flag lang-flag" href="' + href + '" hreflang="' + code + '" lang="' + code +
    '" data-lang="' + code + '" title="' + title + '"><img src="' + asset + '/img/flags/' + iso +
    '.svg" alt="' + label + '" width="24" height="16" loading="lazy" /><span class="visually-hidden">' +
    label + '</span></a>'
  );
}

function langSwitch(asset, lang, page) {
  return LANG_ORDER.map((k) => flag(asset, lang, page, k)).join('\n');
}

/* `P` is the relative prefix to the locale root ('', '../../..', …) so the same
   shell works on top-level and nested pages (e.g. blog/<year>/<month>/<slug>.html). */
function desktopLinks(nav, active, P) {
  return nav
    .map(([href, label]) => '          <a href="' + P + href + '"' + (href === active ? ' aria-current="page"' : '') + '>' + label + '</a>')
    .join('\n');
}
function drawerLinks(nav, P) {
  return nav.map(([href, label]) => '    <a href="' + P + href + '">' + label + '</a>').join('\n');
}
function footerLinks(nav, P) {
  return nav.map(([href, label]) => '            <li><a href="' + P + href + '">' + label + '</a></li>').join('\n');
}
function arrow() {
  return '<svg class="arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* lang: 'en' | 'es'
   active: nav item marked aria-current ('index.html', 'services.html', …)
   page:   locale-relative path, used for the cross-language flag link.
   depth:  levels below the locale root ('', or 3 for blog/<y>/<m>/<slug>.html). */
export function headerHTML(lang, active, page, depth = 0) {
  const L = locale(lang);
  const P = '../'.repeat(depth);
  const A = P + L.asset;
  const nav = L.nav;
  const cur = page || active || 'index.html';
  return (
    '  <header class="site-header">\n' +
    '    <div class="container container--wide">\n' +
    '      <nav class="nav" aria-label="' + L.navAria + '">\n' +
    '        <a class="brand" href="' + P + 'index.html"><span class="brand-mark" aria-hidden="true"></span> SoyJacquesHauzeur</a>\n' +
    '        <div class="nav-links" role="navigation">\n' +
    desktopLinks(nav, active, P) + '\n' +
    '        </div>\n' +
    '        <div class="nav-cta-row">\n' +
    '          <a href="' + CAL + '" target="_blank" rel="noopener" class="btn btn--primary btn--sm">' + L.cta + '\n' +
    '            ' + arrow() + '\n' +
    '          </a>\n' +
    '          <nav class="lang-switch" aria-label="' + L.langLabel + '">\n' +
    langSwitch(A, lang, cur) + '\n' +
    '          </nav>\n' +
    '          <button class="nav-toggle" aria-label="' + L.menuOpen + '" aria-expanded="false" aria-controls="mobile-drawer"><span aria-hidden="true"></span></button>\n' +
    '        </div>\n' +
    '      </nav>\n' +
    '    </div>\n' +
    '  </header>'
  );
}

export function drawerHTML(lang, page, depth = 0) {
  const L = locale(lang);
  const P = '../'.repeat(depth);
  const A = P + L.asset;
  const nav = L.nav;
  const cur = page || 'index.html';
  return (
    '  <div class="mobile-drawer" id="mobile-drawer" aria-hidden="true">\n' +
    '    <button class="drawer-close" aria-label="' + L.menuClose + '">' + L.menuCloseShort + '</button>\n' +
    drawerLinks(nav, P) + '\n' +
    '    <div class="lang-switch" aria-label="' + L.langLabel + '">\n' +
    '      <span class="lang-label">' + L.langLabel + '</span>\n' +
    langSwitch(A, lang, cur) + '\n' +
    '    </div>\n' +
    '  </div>'
  );
}

export function footerHTML(lang, depth = 0) {
  const L = locale(lang);
  const P = '../'.repeat(depth);
  return (
    '  <footer class="site-footer">\n' +
    '    <div class="container container--wide">\n' +
    '      <div class="footer-top footer-top--minimal">\n' +
    '        <div class="footer-brand">\n' +
    '          <span class="brand"><span class="brand-mark" aria-hidden="true"></span> Jacques Hauzeur</span>\n' +
    '          ' + L.footerBrand + '\n' +
    '        </div>\n' +
    '        <div>\n' +
    '          <h4>' + L.footerExplore + '</h4>\n' +
    '          <ul>\n' +
    footerLinks(L.nav, P) + '\n' +
    (L.store ? '            <li><a href="' + P + L.store.href + '">' + L.store.label + '</a></li>\n' : '') +
    '            <li><a href="https://soyjacqueshauzeur.github.io/sparrow/" target="_blank" rel="noopener">sparrow</a></li>\n' +
    '          </ul>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="footer-bottom">\n' +
    '        <span class="footer-copy"><span class="ft-sign">©</span> <span class="ft-year">2026</span> <span class="ft-month"></span> <span class="ft-code">&lt;/&gt;</span> Jacques Hauzeur · SoyJacquesHauzeur</span>\n' +
    '        <div class="footer-meta-links">\n' +
    L.footerMeta.map((t) => '          <a href="#">' + t + '</a>').join('\n') + '\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </footer>'
  );
}
