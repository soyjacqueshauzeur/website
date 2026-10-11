#!/usr/bin/env node
/*
 * fetch-fonts.mjs — descarga las fuentes de Google (woff2) a assets/fonts/ y
 * genera assets/css/fonts.css (@font-face con font-display: swap).
 *
 * Fuente: fonts.gstatic.com (los mismos .woff2 que sirve Google Fonts).
 * Licencias OFL → autoalojarlas es legal.
 *
 * Consolidación de variables: Google sirve Inter Tight y Geist Mono como
 * fuentes VARIABLES, así que el mismo .woff2 cubre varios pesos. En vez de
 * bajar/declarar 4 copias idénticas de Inter Tight, se emite UN @font-face por
 * (familia, subset) con el rango de pesos (`font-weight: 400 700`) apuntando a
 * un solo archivo. Menos peso, menos peticiones y la fuente queda lista antes
 * (menos FOUT/CLS).
 *
 * Boldonse: NO se declara en fonts.css; su woff2 se descarga aquí (lo necesita
 * tools/build-critical.mjs para incrustarlo en base64 en el CSS crítico).
 *
 *   node tools/fetch-fonts.mjs
 */
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

const FONTS_DIR = 'assets/fonts';
const CSS_OUT = 'assets/css/fonts.css';
const SUBSETS = new Set(['latin', 'cyrillic']);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/* inline: true → se descarga pero NO se declara en fonts.css (va incrustada en
   el CSS crítico por build-critical.mjs). */
const FAMILIES = [
  { slug: 'boldonse', query: 'Boldonse', inline: true },
  { slug: 'inter-tight', query: 'Inter+Tight:wght@400;500;600;700' },
  { slug: 'geist-mono', query: 'Geist+Mono:wght@400;500' }
];

mkdirSync(FONTS_DIR, { recursive: true });
const faces = [];
const kept = new Set();

for (const fam of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;

  /* Agrupa por (subset, src): un archivo por fuente real (une sus pesos). */
  const groups = new Map();
  let m;
  while ((m = re.exec(css)) !== null) {
    const subset = m[1];
    if (!SUBSETS.has(subset)) continue;
    const block = m[2];
    const weight = (block.match(/font-weight:\s*(\d+)/) || [, '400'])[1];
    const src = (block.match(/url\((https:\/\/[^)]+\.woff2)\)/) || [, ''])[1];
    const range = (block.match(/unicode-range:\s*([^;]+);/) || [, ''])[1].trim();
    const familyName = (block.match(/font-family:\s*'([^']+)'/) || [, fam.slug])[1];
    if (!src) continue;
    const key = subset + '|' + src;
    if (!groups.has(key)) groups.set(key, { subset, src, familyName, weights: new Set(), range });
    groups.get(key).weights.add(Number(weight));
  }

  for (const g of groups.values()) {
    const weights = [...g.weights].sort((a, b) => a - b);
    const min = weights[0];
    const max = weights[weights.length - 1];
    const isVar = min !== max;
    const file = `${fam.slug}-${isVar ? 'var' : min}-${g.subset}.woff2`;
    const buf = Buffer.from(await (await fetch(g.src, { headers: { 'User-Agent': UA } })).arrayBuffer());
    writeFileSync(`${FONTS_DIR}/${file}`, buf);
    kept.add(file);
    console.log('woff2 ->', file, buf.length + ' B', isVar ? `(variable ${min}..${max})` : '');

    if (fam.inline) continue; // se incrusta en critical.css
    faces.push(
      `@font-face {\n` +
      `  font-family: '${g.familyName}';\n` +
      `  font-style: normal;\n` +
      `  font-weight: ${isVar ? `${min} ${max}` : min};\n` +
      `  font-display: swap;\n` +
      `  src: url('../fonts/${file}') format('woff2');\n` +
      `  unicode-range: ${g.range};\n` +
      `}`
    );
  }
}

/* Limpia woff2 antiguos que ya no se usan (p. ej. los duplicados por peso). */
for (const f of readdirSync(FONTS_DIR)) {
  if (f.endsWith('.woff2') && !kept.has(f)) {
    rmSync(`${FONTS_DIR}/${f}`);
    console.log('borrado  ', f);
  }
}

/* Caras "Fallback" con métricas ajustadas: mientras la fuente real carga, el
   navegador usa una local (Arial / Courier New) con la MISMA anchura y caja de
   línea, así el intercambio no provoca salto de layout (CLS). Valores medidos
   contra los woff2 reales (size-adjust + overrides, escalados por size-adjust). */
const FALLBACKS = `/* Fallbacks con métricas (evitan CLS durante el intercambio de fuente). */
@font-face {
  font-family: 'Boldonse Fallback';
  font-style: normal;
  font-weight: 100 900;
  src: local('Arial'), local('Liberation Sans'), local('ArialMT');
  size-adjust: 117.63%;
  ascent-override: 129.22%;
  descent-override: 34.01%;
  line-gap-override: 0%;
}

@font-face {
  font-family: 'Inter Tight Fallback';
  font-style: normal;
  font-weight: 100 900;
  src: local('Arial'), local('Liberation Sans'), local('ArialMT');
  size-adjust: 95.42%;
  ascent-override: 101.65%;
  descent-override: 25.15%;
  line-gap-override: 0%;
}

@font-face {
  font-family: 'Geist Mono Fallback';
  font-style: normal;
  font-weight: 100 900;
  src: local('Courier New'), local('Liberation Mono');
  size-adjust: 99.98%;
  ascent-override: 101.02%;
  descent-override: 30%;
  line-gap-override: 0%;
}`;

writeFileSync(CSS_OUT, `/* Fuentes autoalojadas (generado por tools/fetch-fonts.mjs — no editar a mano). */\n\n${faces.join('\n\n')}\n\n${FALLBACKS}\n`);
console.log('escrito', CSS_OUT, '(' + faces.length + ' @font-face + 3 fallback)');
