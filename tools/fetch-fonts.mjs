#!/usr/bin/env node
/*
 * fetch-fonts.mjs — descarga las fuentes de Google (woff2) a assets/fonts/ y
 * genera assets/css/fonts.css (@font-face con font-display: swap).
 *
 * Fuente: fonts.gstatic.com (los mismos .woff2 que sirve Google Fonts).
 * Licencias OFL → autoalojarlas es legal.
 *
 *   node tools/fetch-fonts.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const FONTS_DIR = 'assets/fonts';
const CSS_OUT = 'assets/css/fonts.css';
const SUBSETS = new Set(['latin', 'cyrillic']);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const FAMILIES = [
  { slug: 'boldonse', query: 'Boldonse' },
  { slug: 'inter-tight', query: 'Inter+Tight:wght@400;500;600;700' },
  { slug: 'geist-mono', query: 'Geist+Mono:wght@400;500' }
];

mkdirSync(FONTS_DIR, { recursive: true });
const faces = [];

for (const fam of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const subset = m[1];
    const block = m[2];
    if (!SUBSETS.has(subset)) continue;
    const weight = (block.match(/font-weight:\s*(\d+)/) || [, '400'])[1];
    const src = (block.match(/url\((https:\/\/[^)]+\.woff2)\)/) || [, ''])[1];
    const range = (block.match(/unicode-range:\s*([^;]+);/) || [, ''])[1].trim();
    if (!src) continue;

    const file = `${fam.slug}-${weight}-${subset}.woff2`;
    const buf = Buffer.from(await (await fetch(src, { headers: { 'User-Agent': UA } })).arrayBuffer());
    writeFileSync(`${FONTS_DIR}/${file}`, buf);

    faces.push(
      `@font-face {\n` +
      `  font-family: '${(block.match(/font-family:\s*'([^']+)'/) || [, fam.slug])[1]}';\n` +
      `  font-style: normal;\n` +
      `  font-weight: ${weight};\n` +
      `  font-display: swap;\n` +
      `  src: url('../fonts/${file}') format('woff2');\n` +
      `  unicode-range: ${range};\n` +
      `}`
    );
    console.log('woff2 ->', file, buf.length + ' B');
  }
}

writeFileSync(CSS_OUT, `/* Fuentes autoalojadas (generado por tools/fetch-fonts.mjs — no editar a mano). */\n\n${faces.join('\n\n')}\n`);
console.log('escrito', CSS_OUT, '(' + faces.length + ' @font-face)');
