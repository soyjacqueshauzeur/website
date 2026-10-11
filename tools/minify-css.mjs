#!/usr/bin/env node
/*
 * minify-css.mjs — minificador CSS conservador (sin dependencias).
 * Genera styles.min.css y blog.min.css a partir de los originales.
 * Respeta strings ('…' y "…") y comentarios; colapsa espacios fuera de ellos.
 *
 *   node tools/minify-css.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

function minify(css) {
  let out = '';
  let i = 0;
  const n = css.length;
  let quote = null;

  while (i < n) {
    const c = css[i];

    if (quote) {
      out += c;
      if (c === '\\') { out += css[i + 1] || ''; i += 2; continue; }
      if (c === quote) quote = null;
      i++; continue;
    }
    if (c === '"' || c === "'") { quote = c; out += c; i++; continue; }

    if (c === '/' && css[i + 1] === '*') {
      i += 2;
      while (i < n && !(css[i] === '*' && css[i + 1] === '/')) i++;
      i += 2; continue;
    }

    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') {
      let j = i;
      while (j < n && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1];
      const next = css[j];
      if (prev && next && !/[{;:,>]/.test(prev) && !/[{};:,>]/.test(next)) out += ' ';
      i = j; continue;
    }

    out += c; i++;
  }
  return out.trim();
}

let n = 0;
for (const name of ['styles', 'blog']) {
  const src = `assets/css/${name}.css`;
  if (!existsSync(src)) continue;
  const css = readFileSync(src, 'utf8');
  const min = minify(css);
  writeFileSync(`assets/css/${name}.min.css`, min + '\n');
  const pct = Math.round((1 - min.length / css.length) * 100);
  console.log(`${src} -> assets/css/${name}.min.css  (${css.length} → ${min.length} B, -${pct}%)`);
  n++;
}
console.log('Done — ' + n + ' archivo(s).');
