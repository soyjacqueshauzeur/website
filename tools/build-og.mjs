#!/usr/bin/env node
/*
 * Generates one Open Graph card (1200×630) per monthly-hire service, per
 * language, from assets/js/hire-data*.js (single source of truth for the
 * service name, number and translated label).
 *
 *   node tools/build-og.mjs          → assets/og/<stem>.<lang>.png  (12 files)
 *
 * Requires Inkscape. Prices are intentionally NOT rendered so the cards stay
 * valid when prices change.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { locale, availableLangs } from './locales.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'assets/og');
mkdirSync(OUT, { recursive: true });

async function loadHire(lang) {
  delete globalThis.JH_HIRE;
  await import(pathToFileURL(join(ROOT, `assets/js/hire-data${locale(lang).dataSuffix}.js`)).href + '?t=' + Date.now());
  if (!globalThis.JH_HIRE) throw new Error('No JH_HIRE for ' + lang);
  return JSON.parse(JSON.stringify(globalThis.JH_HIRE));
}

const HIRE_WORD = { en: 'Monthly hire', es: 'Hire mensual' };

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function svg({ num, category, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#050507"/>
  <rect x="80" y="86" width="170" height="170" rx="34" fill="#D4FF3D"/>
  <text x="165" y="173" text-anchor="middle" dominant-baseline="central"
        font-family="'Liberation Mono','DejaVu Sans Mono',monospace"
        font-weight="700" font-size="92" fill="#050507">${esc(num)}</text>
  <text x="300" y="150" dominant-baseline="central"
        font-family="'DejaVu Sans','Liberation Sans',sans-serif"
        font-weight="700" font-size="58" fill="#FFFFFF">${esc(category)}</text>
  <text x="302" y="214" dominant-baseline="central"
        font-family="'Liberation Mono','DejaVu Sans Mono',monospace"
        font-size="28" letter-spacing="1" fill="#D4FF3D">${esc(label)}</text>
  <line x1="80" y1="470" x2="1120" y2="470" stroke="#23262b" stroke-width="2"/>
  <text x="80" y="520" dominant-baseline="central"
        font-family="'DejaVu Sans','Liberation Sans',sans-serif"
        font-weight="700" font-size="40" fill="#FFFFFF">Jacques Hauzeur</text>
  <text x="1120" y="520" text-anchor="end" dominant-baseline="central"
        font-family="'Liberation Mono','DejaVu Sans Mono',monospace"
        font-size="28" letter-spacing="1" fill="#D4FF3D">{ } soyjacqueshauzeur.dev</text>
</svg>
`;
}

function render(svgStr, outPath) {
  const tmp = join(OUT, '.tmp.svg');
  writeFileSync(tmp, svgStr);
  try {
    execFileSync('inkscape', [tmp, `--export-filename=${outPath}`, '--export-width=1200', '--export-height=630'], { stdio: 'inherit' });
  } finally {
    rmSync(tmp, { force: true });
  }
}

let count = 0;
for (const lang of availableLangs()) {
  const data = await loadHire(lang);
  for (const svc of data.services) {
    const stem = svc.file.replace(/\.html$/, '');
    const out = join(OUT, `${stem}.${lang}.png`);
    render(svg({ num: svc.num, category: svc.category, label: HIRE_WORD[lang] }), out);
    count++;
    console.log('wrote assets/og/' + stem + '.' + lang + '.png');
  }
}
console.log(`Done — ${count} Open Graph card(s).`);
