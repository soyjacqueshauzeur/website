#!/usr/bin/env node
/*
 * build-critical.mjs — genera assets/css/critical.css extrayendo de
 * assets/css/styles.css el CSS "de arriba del pliegue" (secciones 1–7:
 * tokens, reset, layout, tipografía, header/nav, botones, hero) + el selector
 * de idioma, las reglas móviles del shell (header/hero) y la regla de nav
 * tablet (721–1180px, que de otro modo vive en el CSS diferido y provoca CLS).
 *
 * Además INCRUSTA la fuente Boldonse (base64) al final del archivo: así el
 * titular se pinta con su tipografía desde el primer frame, sin FOUT ni salto.
 * Va al final para que su @font-face gane al de assets/css/fonts.css.
 *
 * Ese archivo se INLINEA en el <head> (lo hace tools/apply-assets.mjs) y el
 * resto de styles.css se carga diferido.
 *
 *   node tools/build-critical.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SRC = readFileSync('assets/css/styles.css', 'utf8');

// 1) Base: todo hasta la sección 9 (incluye secc. 8 = stat strip, que en
//    desktop queda en el pliegue y saltaba al aplicar el CSS diferido).
const cut = SRC.indexOf('/* ---------- 9.');
if (cut < 0) { console.error('No encuentro la sección 9 en styles.css'); process.exit(1); }
const base = SRC.slice(0, cut).trimEnd();

// 2) Language switch (bloque completo, incluye variantes del drawer).
const langStart = SRC.indexOf('/* Language switch');
const langEnd = SRC.indexOf('/* Extra-narrow screens');
const lang = langStart >= 0 && langEnd > langStart ? SRC.slice(langStart, langEnd).trimEnd() : '';

// 3) Extra-narrow (<=420px): evita desbordes del titular en móviles pequeños.
const m420 = SRC.match(/@media \(max-width: 420px\) \{[\s\S]*?\n\}/);
const narrow = m420 ? m420[0] : '';

// 4) Nav tablet (721–1180px): los enlaces bajan a una segunda fila. Sin esto el
//    header cambia de alto al aplicar el CSS diferido y empuja el hero (CLS).
const mTablet = SRC.match(/\/\* Tablet nav[\s\S]*?\n\}/);
const tablet = mTablet ? mTablet[0] : '';

// 4b) Componentes del header/hero que en styles.css viven más abajo pero se ven
//     en el primer pantallazo; si no van en el crítico, el header cambia de alto
//     al cargar el CSS diferido (CLS). El botón de tema y el toggle de retrato.
const mTheme = SRC.match(/\.theme-toggle\{[\s\S]*?html\[data-theme="light"\] \.theme-toggle \.icon-moon\{ display:block; \}/);
const themeToggle = mTheme ? mTheme[0] : '';
const mHpt = SRC.match(/\/\* Hero portrait A\/B toggle \*\/[\s\S]*?\.hero-photo-toggle \.hpt-sep \{[^}]*\}/);
const heroToggle = mHpt ? mHpt[0] : '';

// 5) Shell responsive (header/hero) para móvil/tablet.
const shell = `/* Shell responsive (crítico: header + hero) */
@media (max-width: 1100px) {
  .hero-grid { grid-template-columns: 1fr; gap: var(--space-7); }
  .hero-media { max-width: 100%; aspect-ratio: 4 / 3; justify-self: stretch; }
}
@media (max-width: 720px) {
  html, body { overflow-x: clip; overflow-x: hidden; }
  .nav-links { display: none; }
  .nav-toggle { display: inline-flex; }
  .nav { flex-wrap: wrap; row-gap: var(--space-3); }
  .nav-cta-row { width: 100%; justify-content: space-between; flex-wrap: wrap; row-gap: var(--space-2); }
  .nav-cta-row .lang-switch { margin-inline-start: 0; }
  .hero-headline { font-size: var(--text-4xl); }
}`;

// 6) Boldonse incrustada (base64) — evita el FOUT del titular.
const LATIN_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
let inlineFont = '/* Boldonse incrustada por build-critical.mjs (evita FOUT del titular). */';
const boldFile = 'assets/fonts/boldonse-400-latin.woff2';
if (existsSync(boldFile)) {
  const b64 = readFileSync(boldFile).toString('base64');
  inlineFont += `\n@font-face {\n` +
    `  font-family: 'Boldonse';\n` +
    `  font-style: normal;\n` +
    `  font-weight: 400;\n` +
    `  font-display: block;\n` +
    `  src: url(data:font/woff2;base64,${b64}) format('woff2');\n` +
    `  unicode-range: ${LATIN_RANGE};\n` +
    `}`;
} else {
  console.error('AVISO: falta ' + boldFile + ' (corre tools/fetch-fonts.mjs). Boldonse no se incrusta.');
}

const out = `/* Crítico (generado por tools/build-critical.mjs — no editar a mano). */\n\n${base}\n\n${lang}\n\n${shell}\n\n${narrow}\n\n${tablet}\n\n${themeToggle}\n\n${heroToggle}\n\n${inlineFont}\n`;
writeFileSync('assets/css/critical.css', out);
console.log('escrito assets/css/critical.css (' + out.length + ' bytes)');
