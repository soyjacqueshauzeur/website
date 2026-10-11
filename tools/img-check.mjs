#!/usr/bin/env node
/*
 * img-check.mjs — lint de rutas de imagen.
 *
 * Recorre HTML/CSS/JS/mjs/JSON/XML y comprueba que cada imagen referenciada
 * (src, srcset, data-img, og:image/twitter:image, url(...) y JSON-LD) exista en
 * disco. Ignora URLs externas (http desde otros dominios), data: y valores
 * dinámicos. Sale con código 1 si encuentra referencias rotas.
 *
 *   node tools/img-check.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://soyjacqueshauzeur.dev';
const EXT = '(?:avif|webp|png|jpe?g|svg|gif|ico)';
// Páginas demo fuera del shell: sus imágenes son placeholders y no se revisan.
const IGNORE = new Set(['gallery.html']);

const files = execSync(
  "find . -type f \\( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.mjs' -o -name '*.json' -o -name '*.xml' \\) " +
  "-not -path './.git/*' -not -path './node_modules/*' -not -path './graphify-out/*' -not -path './.playwright-mcp/*'",
  { encoding: 'utf8' }
).trim().split('\n').map((f) => f.replace(/^\.\//, '')).filter(Boolean);

const refRe = new RegExp(`(?:src|srcset|data-img|content|href)=["']([^"']+\\.${EXT}(?:[?#][^"']*)?)["']`, 'gi');
const cssRe = new RegExp(`url\\(\\s*['"]?([^'")]+\\.${EXT}(?:[?#][^'")]*)?)['"]?\\s*\\)`, 'gi');
const absRe = new RegExp(`${SITE.replace(/[.]/g, '\\.')}(/[A-Za-z0-9_./-]+\\.${EXT})`, 'gi');

function collect(text) {
  const out = [];
  for (const re of [refRe, cssRe, absRe]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) out.push(m[1]);
  }
  return out;
}

function normalize(ref, file) {
  let r = ref.trim();
  if (r.startsWith('http')) return null;                 // externo (excepto nuestro dominio, ya capturado)
  if (r.startsWith('data:')) return null;
  if (r.includes('${') || r.includes('{{')) return null; // dinámico
  r = r.replace(/[?#].*$/, '');
  if (r.startsWith('/')) return resolve(ROOT, '.' + r);   // raíz del sitio
  return resolve(ROOT, dirname(file), r);                 // relativo al archivo
}

const missing = [];
for (const file of files) {
  if (IGNORE.has(file)) continue;
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  for (const ref of collect(text)) {
    const p = normalize(ref, file);
    if (!p) continue;
    if (!existsSync(p)) missing.push(`${file}  ->  ${ref}`);
  }
}

const uniq = [...new Set(missing)].sort();
if (uniq.length) {
  console.log('FAIL — ' + uniq.length + ' imagen(es) referenciada(s) que no existen:');
  uniq.forEach((m) => console.log('  ' + m));
  process.exit(1);
}
console.log('PASS — todas las imágenes referenciadas existen (' + files.length + ' archivos revisados).');
