#!/usr/bin/env node
/*
 * build-critical.mjs — genera assets/css/critical.css extrayendo de
 * assets/css/styles.css el CSS "de arriba del pliegue" (secciones 1–7:
 * tokens, reset, layout, tipografía, header/nav, botones, hero) + el selector
 * de idioma y las reglas móviles del shell (header/hero).
 *
 * Ese archivo se INLINEA en el <head> (lo hace tools/apply-assets.mjs) y el
 * resto de styles.css se carga diferido.
 *
 *   node tools/build-critical.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = readFileSync('assets/css/styles.css', 'utf8');

// 1) Base: todo hasta la sección 8.
const cut = SRC.indexOf('/* ---------- 8.');
if (cut < 0) { console.error('No encuentro la sección 8 en styles.css'); process.exit(1); }
const base = SRC.slice(0, cut).trimEnd();

// 2) Language switch (bloque completo, incluye variantes del drawer).
const langStart = SRC.indexOf('/* Language switch');
const langEnd = SRC.indexOf('/* Extra-narrow screens');
const lang = langStart >= 0 && langEnd > langStart ? SRC.slice(langStart, langEnd).trimEnd() : '';

// 3) Extra-narrow (<=420px): evita desbordes del titular en móviles pequeños.
const m420 = SRC.match(/@media \(max-width: 420px\) \{[\s\S]*?\n\}/);
const narrow = m420 ? m420[0] : '';

// 4) Shell responsive (header/hero) para móvil/tablet.
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

const out = `/* Crítico (generado por tools/build-critical.mjs — no editar a mano). */\n\n${base}\n\n${lang}\n\n${narrow}\n\n${shell}\n`;
writeFileSync('assets/css/critical.css', out);
console.log('escrito assets/css/critical.css (' + out.length + ' bytes)');
