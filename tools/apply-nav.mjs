#!/usr/bin/env node
/*
 * Applies the canonical site shell (header + mobile drawer + footer) — as
 * defined once in tools/site-shell.mjs — to every real page, top-level and
 * nested (blog/<year>/<month>/<slug>.html). Language and depth are derived
 * from the path via tools/locales.mjs, so nav links and asset paths resolve
 * correctly at any depth. Idempotent (consumes the line's leading indent).
 *
 *   node tools/apply-nav.mjs
 *
 * The hire / contract pages are regenerated separately by their builders from
 * the SAME site-shell module and must NOT be passed here.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { headerHTML, drawerHTML, footerHTML } from './site-shell.mjs';
import { langForPath, locale } from './locales.mjs';

const PAGES = [
  // top-level
  'index.html', 'clients.html', 'sessions.html', 'blog.html', 'gallery.html',
  'es/index.html', 'es/clients.html', 'es/sesiones.html', 'es/blog.html',
  // blog articles (nested)
  'blog/2026/09/chat-marketing.html', 'blog/2026/09/webs-2026.html', 'blog/2026/09/ia-vida-moderna.html', 'blog/2026/10/ia-en-el-trabajo.html',
  'es/blog/2026/09/chat-marketing.html', 'es/blog/2026/09/webs-2026.html', 'es/blog/2026/09/ia-vida-moderna.html', 'es/blog/2026/10/ia-en-el-trabajo.html'
];

function relOf(path) {
  const lang = langForPath(path);
  return path.slice(locale(lang).dir.length); // locale-relative path
}

function activeFor(rel) {
  const base = rel.split('/').pop();
  if (rel === 'index.html') return 'index.html';
  if (rel.startsWith('blog/') && base !== 'index.html') return 'blog.html';
  if (base === 'gallery.html') return ''; // demo, not in the nav
  return base;
}

function transform(path) {
  let src = readFileSync(path, 'utf8');
  const orig = src;
  const lang = langForPath(path);
  const rel = relOf(path);
  const depth = rel.split('/').length - 1;
  const active = activeFor(rel);

  src = src.replace(
    /[ \t]*<header class="site-header">[\s\S]*?<\/header>/,
    () => headerHTML(lang, active, rel, depth)
  );
  src = src.replace(
    /[ \t]*<div class="mobile-drawer" id="mobile-drawer"[\s\S]*?(?=\s*<main id="main">)/,
    () => drawerHTML(lang, rel, depth)
  );
  src = src.replace(
    /[ \t]*<footer class="site-footer">[\s\S]*?<\/footer>/,
    () => footerHTML(lang, depth)
  );

  if (src !== orig) {
    writeFileSync(path, src);
    console.log('updated ' + path);
  } else {
    console.log('unchanged ' + path);
  }
}

for (const f of PAGES) transform(f);
