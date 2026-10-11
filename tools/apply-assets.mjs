#!/usr/bin/env node
/*
 * apply-assets.mjs — reescribe el <head> de las páginas:
 *   1) Fuentes autoalojadas: quita Google Fonts (+preconnect) y añade
 *      assets/css/fonts.css + preload de woff2 clave.  <!-- fonts:start/end -->
 *   2) CSS crítico inline + styles.min.css (y blog.min.css) diferido.
 *      <!-- critical:start/end -->   (solo en páginas que enlazan styles.css)
 *
 * Idempotente. Requiere: fonts.css, critical.css, styles.min.css, blog.min.css.
 *
 *   node tools/apply-assets.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname } from 'node:path';

const critical = existsSync('assets/css/critical.css') ? readFileSync('assets/css/critical.css', 'utf8').trim() : '';

const FONTS_START = '<!-- fonts:start -->';
const FONTS_END = '<!-- fonts:end -->';
const CRIT_START = '<!-- critical:start -->';
const CRIT_END = '<!-- critical:end -->';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*' -not -path './node_modules/*'",
  { encoding: 'utf8' }
).trim().split('\n').map((f) => f.replace(/^\.\//, '')).filter(Boolean);

const PRECONNECT_GOOGLEAPI = /\n[ \t]*<link[^>]*href="https:\/\/fonts\.googleapis\.com"[^>]*>/g;
const PRECONNECT_GSTATIC = /\n[ \t]*<link[^>]*href="https:\/\/fonts\.gstatic\.com"[^>]*>/g;
const CSS2_LINK = /\n[ \t]*<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/;

let changed = 0;
for (const file of files) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  if (!/fonts\.googleapis\.com/.test(src) && !src.includes(FONTS_START)) continue;
  const orig = src;

  // Prefijo de assets: desde styles.css si existe; si no, por profundidad.
  const m = src.match(/href="([^"]*?)css\/(?:styles|blog)(?:\.min)?\.css"/);
  const depth = dirname(file) === '.' ? 0 : dirname(file).split('/').filter(Boolean).length;
  const prefix = m ? m[1].replace(/\/$/, '') : '../'.repeat(depth) + 'assets';

  /* 1) Fuentes */
  const fontsBlock = `${FONTS_START}
  <link rel="preload" href="${prefix}/fonts/inter-tight-400-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="${prefix}/fonts/boldonse-400-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="${prefix}/css/fonts.css" />
  ${FONTS_END}`;

  if (src.includes(FONTS_START)) {
    src = src.replace(new RegExp(esc(FONTS_START) + '[\\s\\S]*?' + esc(FONTS_END)), fontsBlock);
  } else if (CSS2_LINK.test(src)) {
    src = src.replace(PRECONNECT_GOOGLEAPI, '').replace(PRECONNECT_GSTATIC, '');
    src = src.replace(CSS2_LINK, '\n  ' + fontsBlock);
  }

  /* 2) Crítico + diferido (solo si la página enlaza styles.css) */
  const stylesLink = new RegExp('([ \\t]*)<link rel="stylesheet" href="' + esc(prefix) + '/css/styles(?:\\.min)?\\.css"[^>]*\\/?>');
  if (stylesLink.test(src)) {
    const critBlock = `${CRIT_START}
  <style>${critical}</style>
  <link rel="stylesheet" href="${prefix}/css/styles.min.css" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="${prefix}/css/styles.min.css" /></noscript>
  ${CRIT_END}`;
    src = src.includes(CRIT_START)
      ? src.replace(new RegExp(esc(CRIT_START) + '[\\s\\S]*?' + esc(CRIT_END)), critBlock)
      : src.replace(stylesLink, critBlock);
  }

  /* blog.css -> diferido (si existe y no está ya) */
  const blogLink = new RegExp('([ \\t]*)<link rel="stylesheet" href="' + esc(prefix) + '/css/blog(?:\\.min)?\\.css"[^>]*\\/?>');
  if (!src.includes('blog.min.css') && blogLink.test(src)) {
    src = src.replace(blogLink, (_a, ind) =>
      `${ind}<link rel="stylesheet" href="${prefix}/css/blog.min.css" media="print" onload="this.media='all'" />\n` +
      `${ind}<noscript><link rel="stylesheet" href="${prefix}/css/blog.min.css" /></noscript>`);
  }

  if (src !== orig) { writeFileSync(file, src); changed++; }
}
console.log('apply-assets -> ' + changed + ' archivo(s) actualizados.');
