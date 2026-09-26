#!/usr/bin/env node
/*
 * Applies the canonical site shell (header + mobile drawer + footer) — as
 * defined once in tools/site-shell.mjs — to the real top-level static pages
 * (EN root + /es/). Rewrites the whole <header>, the mobile drawer and the
 * footer so the nav is identical to index.html EN / es/index.html ES.
 *
 * The hire pages (services.html + 6 service pages) are regenerated separately
 * by build-hire-pages.mjs from the SAME site-shell module and must NOT be
 * passed to this script.
 *
 *   node tools/apply-nav.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { headerHTML, drawerHTML, footerHTML } from './site-shell.mjs';

const PAGES = [
  // [path, lang, activeNavItem, pageBasenameForLangLink]
  ['index.html', 'en', 'index.html'],
  ['clients.html', 'en', 'clients.html'],
  ['sessions.html', 'en', 'sessions.html'],
  ['es/index.html', 'es', 'index.html'],
  ['es/clients.html', 'es', 'clients.html'],
  ['es/sesiones.html', 'es', 'sesiones.html'],
  ['es/blog.html', 'es', 'blog.html']
];

function strip(path) {
  return path.replace(/\.\.\//g, '').replace(/^\/+/, '');
}

function transform(path, lang, active) {
  let src = readFileSync(path, 'utf8');
  const orig = src;
  const page = path.split('/').pop();

  // Header
  src = src.replace(
    /<header class="site-header">[\s\S]*?<\/header>/,
    () => headerHTML(lang, active, page)
  );

  // Mobile drawer (from its opening tag up to <main id="main">)
  src = src.replace(
    /<div class="mobile-drawer" id="mobile-drawer"[\s\S]*?(?=\s*<main id="main">)/,
    () => drawerHTML(lang, page)
  );

  // Footer
  src = src.replace(
    /<footer class="site-footer">[\s\S]*?<\/footer>/,
    () => footerHTML(lang)
  );

  if (src !== orig) {
    writeFileSync(path, src);
    console.log('updated ' + path);
  } else {
    console.log('unchanged ' + path);
  }
}

for (const [f, lang, active] of PAGES) transform(f, lang, active);
