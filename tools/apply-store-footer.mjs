#!/usr/bin/env node
/*
 * apply-store-footer.mjs — inyecta el footer de la tienda (fuente única:
 * tools/store-footer.mjs) en todas las páginas de es/tienda/.
 *
 * Idempotente: escribe el bloque entre los marcadores
 *   <!-- sf:start --> ... <!-- sf:end -->
 * (si no existen, reemplaza el <footer>…</footer> actual por primera vez).
 *
 *   node tools/apply-store-footer.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { storeFooterBlock } from './store-footer.mjs';

const PAGES = [
  'es/tienda/tienda.html',
  'es/tienda/cookies.html',
  'es/tienda/terminos.html',
  'es/tienda/envios.html',
  'es/tienda/devoluciones.html',
  'es/tienda/privacidad.html',
  'es/tienda/synaptic-sleep-5-z/index.html',
  'es/tienda/synaptic-sleep-5-z/product.html',
  'es/tienda/synaptic-sleep-5-z/product2.html',
];

const START = '<!-- sf:start -->';
const END = '<!-- sf:end -->';

function baseFor(path) {
  return path.startsWith('es/tienda/synaptic-sleep-5-z/') ? '../' : '';
}

let changed = 0;
for (const file of PAGES) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { console.log('skip (no existe): ' + file); continue; }
  const orig = src;
  const block = START + '\n' + storeFooterBlock(baseFor(file)) + '\n' + END;
  const markerRe = new RegExp(START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (markerRe.test(src)) {
    src = src.replace(markerRe, block);
  } else {
    src = src.replace(/[ \t]*<footer[\s\S]*?<\/footer>/, block);
  }

  if (src !== orig) { writeFileSync(file, src); changed++; console.log('footer -> ' + file); }
  else { console.log('unchanged ' + file); }
}
console.log('Done — ' + changed + ' file(s) updated.');
