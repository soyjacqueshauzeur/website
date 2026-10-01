#!/usr/bin/env node
/*
 * Applies the canonical site shell (header + mobile drawer + footer) — as
 * defined once in tools/site-shell.mjs — to the real top-level static pages
 * (EN root + /es/). Rewrites the whole <header>, the mobile drawer and the
 * footer so the nav is identical to index.html EN / es/index.html ES.
 *
 * Language is derived from the path via tools/locales.mjs (no per-page
 * language list), and the leading indentation is consumed so re-running the
 * tool is idempotent (it no longer accumulates spaces).
 *
 * The hire pages (services.html + 6 service pages) are regenerated separately
 * by build-hire-pages.mjs from the SAME site-shell module and must NOT be
 * passed to this script.
 *
 *   node tools/apply-nav.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { headerHTML, drawerHTML, footerHTML } from './site-shell.mjs';
import { langForPath } from './locales.mjs';

const PAGES = [
  'index.html',
  'clients.html',
  'sessions.html',
  'blog.html',
  'es/index.html',
  'es/clients.html',
  'es/sesiones.html',
  'es/blog.html'
];

function transform(path) {
  let src = readFileSync(path, 'utf8');
  const orig = src;
  const lang = langForPath(path);
  const page = path.split('/').pop();
  const active = page;

  // Header (consume the line's leading indentation for idempotency)
  src = src.replace(
    /[ \t]*<header class="site-header">[\s\S]*?<\/header>/,
    () => headerHTML(lang, active, page)
  );

  // Mobile drawer (from its opening tag up to <main id="main">)
  src = src.replace(
    /[ \t]*<div class="mobile-drawer" id="mobile-drawer"[\s\S]*?(?=\s*<main id="main">)/,
    () => drawerHTML(lang, page)
  );

  // Footer
  src = src.replace(
    /[ \t]*<footer class="site-footer">[\s\S]*?<\/footer>/,
    () => footerHTML(lang)
  );

  if (src !== orig) {
    writeFileSync(path, src);
    console.log('updated ' + path);
  } else {
    console.log('unchanged ' + path);
  }
}

for (const f of PAGES) transform(f);
