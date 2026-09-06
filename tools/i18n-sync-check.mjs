#!/usr/bin/env node
/*
 * i18n sync guard — static site EN/ES/RU.
 * Compares the structural skeleton of index.html against es/index.html and
 * ru/index.html so a change (image, section count, client cards, areas,
 * journal…) in one language is not forgotten in the others.
 * Text may differ (translation), structure must not.
 */
import { existsSync, readFileSync } from 'node:fs';

const EN = 'index.html';
const LOCALES = [
  { dir: 'es/', label: 'ES' },
  { dir: 'ru/', label: 'RU' },
];

function read(p) {
  return readFileSync(p, 'utf8');
}

function norm(path) {
  return path.replace(/\.\.\//g, '').replace(/^\/+/, '');
}

function imgAssets(html) {
  const out = [];
  for (const m of html.matchAll(/src="([^"]+)"/g)) {
    const p = norm(m[1]);
    if (/\.(jpe?g|png|svg|webp|gif|ico)(\?|#|$)/i.test(p)) out.push(p);
  }
  return out.sort();
}

function count(html, sel) {
  return (html.match(new RegExp(sel, 'g')) || []).length;
}

const checks = [
  ['client cards', 'class="client-card"'],
  ['linked client logos', 'class="client-logo-link"'],
  ['area cards', 'class="cap-card'],
  ['press rows', 'class="press-row"'],
  ['language switches', 'class="lang-switch"'],
];

let ok = true;
function fail(msg) {
  ok = false;
  console.error('  ✗ ' + msg);
}

const en = read(EN);
const enImgs = imgAssets(en);

const active = LOCALES.filter((l) => existsSync(l.dir + 'index.html'));

for (const l of active) {
  const loc = read(l.dir + 'index.html');
  const imgs = imgAssets(loc);
  console.log(`\n=== EN vs ${l.label} (${l.dir}index.html) ===`);
  console.log('Images:');
  for (const a of new Set([...enImgs, ...imgs])) {
    const ne = enImgs.filter((x) => x === a).length;
    const nl = imgs.filter((x) => x === a).length;
    if (ne === nl) console.log(`  ✓ ${a} ×${ne}`);
    else fail(`${l.label} MISS ${a} (EN:${ne} ${l.label}:${nl})`);
  }
  console.log('Structure:');
  for (const [name, sel] of checks) {
    const ne = count(en, sel);
    const nl = count(loc, sel);
    if (ne === nl) console.log(`  ✓ ${name}: ${ne}`);
    else fail(`${l.label} ${name}: EN ${ne} vs ${l.label} ${nl}`);
  }
}

for (const l of LOCALES) {
  if (!active.includes(l)) {
    console.log(`\n— ${l.label}: /${l.dir} aún no existe (se revisará automáticamente cuando se cree).`);
  }
}

console.log(ok ? '\nPASS — idiomas presentes sincronizados con EN.' : '\nFAIL — hay diferencias entre idiomas.');
process.exit(ok ? 0 : 1);
