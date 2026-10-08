#!/usr/bin/env node
/*
 * apply-adsense.mjs — inserta el script de Google AdSense en el <head> de los
 * artículos del blog (EN + ES) y del home EN (index.html). NO toca el home ES,
 * los listados (blog.html / es/blog.html) ni los archivos mensuales (…/index.html).
 *
 * Idempotente: escribe el bloque marcado `<!-- adsense:start --> … <!-- adsense:end -->`
 * (se reemplaza, nunca se duplica). Se ancla tras `<!-- seo:end -->` si existe.
 *
 *   node tools/apply-adsense.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const CLIENT = 'ca-pub-3441201236960010';
const START = '<!-- adsense:start -->';
const END = '<!-- adsense:end -->';
const BLOCK = `${START}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}" crossorigin="anonymous"></script>
  ${END}`;

/* Objetivos: artículos blog/<año>/<mes>/<slug>.html y es/blog/<año>/<mes>/<slug>.html,
 * más el home EN (index.html). NO el home ES ni los listados/mensuales. */
const isTarget = (f) => f === 'index.html' || /^(?:es\/)?blog\/\d{4}\/\d{2}\/[^/]+\.html$/.test(f);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_BLOCK = new RegExp(esc(START) + '[\\s\\S]*?' + esc(END));

const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*' -not -path './node_modules/*'",
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .map((f) => f.replace(/^\.\//, ''))
  .filter(Boolean);

let changed = 0;
for (const file of files) {
  if (!isTarget(file)) continue;
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  const orig = src;
  if (RE_BLOCK.test(src)) {
    src = src.replace(RE_BLOCK, BLOCK);
  } else if (/<!-- seo:end -->/.test(src)) {
    src = src.replace(/(<!-- seo:end -->)/, '$1\n  ' + BLOCK);
  } else if (/<meta name="viewport"[^>]*>/.test(src)) {
    src = src.replace(/(<meta name="viewport"[^>]*>)/, '$1\n  ' + BLOCK);
  } else {
    console.log('skip (no anchor): ' + file);
    continue;
  }
  if (src !== orig) { writeFileSync(file, src); changed++; console.log('adsense -> ' + file); }
}
console.log('Done — ' + changed + ' file(s) updated.');
