#!/usr/bin/env node
/*
 * apply-adsense-tag.mjs — añade a cada artículo del blog (EN + ES) UNA sola
 * referencia al módulo único de AdSense:
 *
 *   <!-- adsense.js:start (código único AdSense) -->
 *   <script type="module" src="…/assets/js/adsense.js"></script>
 *   <!-- adsense.js:end -->
 *
 * El código de AdSense (cliente, slots, loader y las 2 unidades) vive una sola
 * vez en assets/js/adsense.js; el módulo se auto-monta en el artículo.
 *
 * También limpia los bloques inline antiguos (`<!-- ad-unit:… -->`) que se
 * hubieran insertado en el cuerpo, para no duplicar unidades.
 *
 * Idempotente: reemplaza el bloque marcado, nunca lo duplica.
 *
 *   node tools/apply-adsense-tag.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { langForPath, locale, assetPrefix } from './locales.mjs';

const START = '<!-- adsense.js:start (código único AdSense) -->';
const END = '<!-- adsense.js:end -->';

/* Solo artículos: blog/<año>/<mes>/<slug>.html y es/blog/<año>/<mes>/<slug>.html. */
const isTarget = (f) => /^(?:es\/)?blog\/\d{4}\/\d{2}\/[^/]+\.html$/.test(f);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* Consume el salto previo + indentación + bloque (sin el salto final). */
const RE_TAG = new RegExp('\\n[ \\t]*' + esc(START) + '[\\s\\S]*?' + esc(END), 'g');
/* Limpia bloques inline antiguos del cuerpo (dejando una línea en blanco). */
const RE_LEGACY = /\n\n[ \t]*<!-- ad-unit:(?:in-article|display) -->[\s\S]*?<!-- \/ad-unit:(?:in-article|display) -->/g;

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

  // limpia bloques inline antiguos y la referencia previa
  src = src.replace(RE_LEGACY, '').replace(RE_TAG, '');

  // prefijo de assets según idioma/profundidad (p. ej. ../../../assets)
  const lang = langForPath(file);
  const rel = file.slice(locale(lang).dir.length);           // blog/<año>/<mes>/<slug>.html
  const depth = rel.split('/').length - 1;                   // 3
  const srcAttr = `${assetPrefix(lang, depth)}/js/adsense.js`;

  const block = `${START}
  <script type="module" src="${srcAttr}"></script>
  ${END}`;

  if (!/<\/body>/.test(src)) { console.log('skip (no </body>): ' + file); continue; }
  src = src.replace(/\n<\/body>/, `\n${block}\n</body>`);

  if (src !== orig) { writeFileSync(file, src); changed++; console.log('adsense.js -> ' + file); }
}
console.log('Done — ' + changed + ' file(s) updated.');
