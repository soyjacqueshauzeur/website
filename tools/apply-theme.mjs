#!/usr/bin/env node
/*
 * apply-theme.mjs — inyecta el script de inicialización de tema (light/dark)
 * en el <head> de todas las páginas del sitio (EN + ES), ANTES del CSS para
 * evitar el flash. Misma lógica que la tienda: localStorage('jh-theme') y,
 * por defecto, claro de 4:00 a 18:00 y oscuro el resto.
 *
 * Idempotente: escribe el bloque marcado `<!-- theme:init -->`.
 * Excluye las páginas de la tienda (es/tienda/**), que ya tienen su propia lógica.
 *
 *   node tools/apply-theme.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const MARK = '<!-- theme:init -->';
const SCRIPT =
  MARK + '\n' +
  '  <script>(function(){try{var t=localStorage.getItem("jh-theme");if(t!=="light"&&t!=="dark"){var h=new Date().getHours();t=(h>=4&&h<18)?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>';

const SKIP = /(^|\/)es\/tienda\//;

const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*' -not -path './node_modules/*'",
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .map((f) => f.replace(/^\.\//, ''))
  .filter(Boolean);

const re = new RegExp(MARK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?<\\/script>');

let changed = 0;
for (const file of files) {
  if (SKIP.test(file)) continue;
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  const orig = src;
  if (re.test(src)) {
    src = src.replace(re, SCRIPT);
  } else {
    src = src.replace(/(<meta name="viewport"[^>]*>)/, '$1\n  ' + SCRIPT);
  }
  if (src !== orig) { writeFileSync(file, src); changed++; console.log('theme -> ' + file); }
}
console.log('Done — ' + changed + ' file(s) updated.');
