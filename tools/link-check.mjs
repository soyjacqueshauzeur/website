#!/usr/bin/env node
/*
 * link-check.mjs — verifica las reglas "3 · Cantidad" y "4 · Anclas" del mapa
 * interlink (assets/<vault>/interlink/01 · Reglas de enlazado.md).
 *
 * Regla 3 — Cantidad (errores):
 *   1. Toda URL indexable (sitemap) recibe >= 3 enlaces contextuales
 *      (dentro de <main>, sin nav/drawer/footer, sin contarse a sí misma).
 *   2. Al menos 1 de esos enlaces viene de una página de nivel superior.
 *   3. Profundidad <= 3 clics desde la home.
 *   4. Toda página emite >= 3 enlaces contextuales a URLs indexables.
 *   Aviso: más de MAX_OUT enlaces contextuales salientes (salvo páginas de lista).
 *
 * Regla 4 — Anclas (errores):
 *   5. Ancla genérica prohibida ("clic aquí", "leer más", "read more", …).
 *   6. Dos enlaces seguidos con el mismo ancla hacia destinos distintos.
 *   7. Ancla vacía (icono sin texto) o que es el propio nombre del archivo.
 *   Avisos:
 *   8. Mismo ancla hacia más de un destino en la misma página.
 *   9. Mismo ancla exacto hacia el mismo destino en más de 2 páginas
 *      (sobre-optimización).
 *
 * Uso: node tools/link-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MAX_OUT = 8;
const MAX_SAME_ANCHOR_PAGES = 2;
const LIST_PAGES = new Set(['clients.html', 'es/clients.html', 'blog.html', 'es/blog.html']);
const EXCLUDE = new Set(['404.html', 'es/404.html', 'contract.html', 'es/contrato.html', 'gallery.html', 'blog-t.html', 'price-t.html']);
const HOME = 'index.html';

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------- anclas prohibidas ---------- */
const FORBIDDEN = new Set([
  'clic aqui', 'click aqui', 'haz clic aqui', 'leer mas', 'ver mas', 'saber mas', 'mas info',
  'mas informacion', 'este enlace', 'aqui', 'mas detalles', 'detalles',
  'click here', 'read more', 'see more', 'learn more', 'more info', 'more information',
  'this link', 'here', 'details', 'read on',
]);

function norm(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[←→›»>·|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- universo de URLs indexables ---------- */
const SITE = 'https://soyjacqueshauzeur.dev/';
const pages = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].trim())
  .filter((u) => u.startsWith(SITE))
  .map((u) => {
    const rel = u.slice(SITE.length);
    return !rel || rel.endsWith('/') ? rel + 'index.html' : rel;
  })
  .filter((p) => !EXCLUDE.has(p))
  .sort();

const pageSet = new Set(pages);

/* ---------- universo noindex (regla 6) ---------- */
/* Todo HTML del repo que no está en el sitemap es, por definición, noindex. */
const allHtml = fs
  .globSync('**/*.html', { exclude: (f) => /^(assets|node_modules|\.git|graphify-out|\.playwright-mcp)\//.test(f) })
  .map((f) => f.split(path.sep).join('/'))
  .filter((f) => !f.endsWith('.min.html'));
const noindexSet = new Set(allHtml.filter((f) => !pageSet.has(f)));

/* ---------- extracción ---------- */
function stripNoise(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

function mainRegion(html) {
  const m = /<main\b[\s\S]*?<\/main>/i.exec(html);
  return m ? m[0] : '';
}

function resolve(fromPage, href) {
  if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (/\.(css|js|png|jpe?g|webp|avif|svg|ico|woff2?|xml|txt|json|pdf)$/i.test(clean)) return null;
  let target;
  if (clean.startsWith('/')) {
    target = path.posix.normalize(clean.slice(1)); // ruta absoluta del sitio
  } else {
    const base = path.posix.dirname(fromPage);
    target = path.posix.normalize(path.posix.join(base === '.' ? '' : base, clean));
  }
  if (target.endsWith('/')) target += 'index.html';
  if (!target.endsWith('.html')) return null;
  return target.replace(/^\.\//, '');
}

function textOf(inner) {
  return inner
    .replace(/<img\b[^>]*\balt="([^"]*)"/gi, ' $1 ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- grafo ---------- */
const contextualOut = new Map();
const inbound = new Map();
const allLinks = new Map();
const anchorsFor = new Map(); // target -> Map(anchorText -> Set(pages))
const pageAnchorErrors = new Map();
const anchorList = new Map(); // page -> [{text,target}] en orden de documento

for (const p of pages) {
  const html = read(p);
  const main = stripNoise(mainRegion(html));
  const out = new Set();
  const seen = []; // {text, target} en orden de documento

  for (const m of main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1];
    if (/aria-hidden="true"/i.test(attrs)) continue; // duplicado decorativo (patrón a11y)
    const href = (/\bhref="([^"]*)"/i.exec(attrs) || [])[1];
    const target = resolve(p, href);
    if (!target || !pageSet.has(target) || target === p) continue;
    out.add(target);
    seen.push({ text: textOf(m[2]), target });
  }

  contextualOut.set(p, out);
  anchorList.set(p, seen);
  for (const t of out) {
    if (!inbound.has(t)) inbound.set(t, new Set());
    inbound.get(t).add(p);
  }

  // anclas
  for (const { text, target } of seen) {
    const key = norm(text);
    if (!key) continue;
    if (!anchorsFor.has(target)) anchorsFor.set(target, new Map());
    const map = anchorsFor.get(target);
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(p);
  }

  // enlaces globales (para la profundidad real de rastreo)
  const all = new Set();
  for (const m of stripNoise(html).matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const t = resolve(p, m[1]);
    if (t && pageSet.has(t)) all.add(t);
  }
  allLinks.set(p, all);

  // reglas de ancla por página (se evalúan aquí: necesitan el orden)
  const errorsHere = [];
  for (let i = 0; i < seen.length; i++) {
    const { text, target } = seen[i];
    const key = norm(text);
    if (FORBIDDEN.has(key)) errorsHere.push(`ancla genérica prohibida «${text}» → ${target}`);
    if (!key) errorsHere.push(`ancla vacía (icono sin texto) → ${target}`);
    if (/^[\w./-]+\.html$/.test(key)) errorsHere.push(`ancla que es un nombre de archivo «${text}» → ${target}`);
    if (i > 0 && key && key === norm(seen[i - 1].text) && target !== seen[i - 1].target) {
      errorsHere.push(`dos enlaces seguidos con el mismo ancla «${text}» → ${seen[i - 1].target} y ${target}`);
    }
  }
  // mismo ancla a destinos distintos en la página
  const byText = new Map();
  for (const { text, target } of seen) {
    const key = norm(text);
    if (!key) continue;
    if (!byText.has(key)) byText.set(key, new Set());
    byText.get(key).add(target);
  }
  for (const [key, targets] of byText) {
    if (targets.size > 1) errorsHere.push(`ancla «${key}» apunta a ${targets.size} destinos distintos: ${[...targets].join(', ')}`);
  }

  pageAnchorErrors.set(p, errorsHere);
}

/* ---------- profundidad ---------- */
/* Cada idioma tiene su raíz: /index.html y /<locale>/index.html son nivel 0. */
const ROOTS = pages.filter((p) => p === HOME || /^[^/]+\/index\.html$/.test(p));
const depth = new Map(ROOTS.map((r) => [r, 0]));
const queue = [...ROOTS];
while (queue.length) {
  const cur = queue.shift();
  for (const t of allLinks.get(cur) || []) {
    if (!depth.has(t)) {
      depth.set(t, depth.get(cur) + 1);
      queue.push(t);
    }
  }
}

/* ---------- regla 6 · ninguna URL indexable enlaza a una noindex ---------- */
const NOINDEX_LINK_REPORT = new Map();
for (const p of pages) {
  const html = stripNoise(read(p));
  const bad = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const t = resolve(p, m[1]);
    if (t && noindexSet.has(t)) bad.add(t);
  }
  if (bad.size) NOINDEX_LINK_REPORT.set(p, [...bad]);
}

/* ---------- regla 7 · simetría de clusters ---------- */
const CLUSTER_PAIRS = [
  ['marketing.html', 'campaigns.html'],
  ['marketing.html', 'ecommerce.html'],
  ['ai.html', 'chatbots.html'],
  ['ecommerce.html', 'financial-planning.html'],
];
const localeDirs = ['', 'es/'].filter((d) => pages.some((p) => p.startsWith(d + 'index.html') && p === d + 'index.html'));

/* ---------- regla 8 · bilingüe ---------- */
/* Un enlace del cuerpo nunca cruza de idioma: el cambio lo hace el flag del nav. */
const langOf = (p) => (/^es\//.test(p) ? 'es' : 'en');
const CROSS = [];
for (const p of pages) {
  for (const t of contextualOut.get(p) || []) {
    if (langOf(t) !== langOf(p)) CROSS.push(`${p} → ${t}`);
  }
}

/* 8a · un artículo tiene el mismo slug en los dos idiomas */
const SLUG_MISMATCH = [];
for (const p of pages) {
  const m = /^(es\/)?(blog\/\d{4}\/\d{2}\/[^/]+\.html)$/.exec(p);
  if (!m) continue;
  const twin = m[1] ? m[2] : 'es/' + m[2];
  if (!pageSet.has(twin)) SLUG_MISMATCH.push(`${p} → falta ${twin} (slug distinto o artículo sin traducir)`);
}

/* 8b · ancla traducida, no calcada (palabras funcionales inglesas en ES) */
const EN_STOPWORDS = new Set([
  'the', 'and', 'your', 'all', 'see', 'read', 'more', 'from', 'with', 'our',
  'this', 'that', 'what', 'how', 'why', 'view', 'learn', 'find', 'browse',
]);
const CALQUES = [];
for (const p of pages) {
  if (langOf(p) !== 'es') continue;
  for (const { text, target } of anchorList.get(p) || []) {
    const words = norm(text).split(/[^a-z]+/).filter(Boolean);
    const hit = words.filter((w) => EN_STOPWORDS.has(w));
    if (hit.length) CALQUES.push(`${p}: «${text}» (${hit.join(', ')}) → ${target}`);
  }
}

/* 8c · rutas relativas en el cuerpo, nunca absolutas a mano */
const ABSOLUTE = [];
for (const p of pages) {
  const fragment = stripNoise(mainRegion(read(p)));
  for (const m of fragment.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/gi)) {
    ABSOLUTE.push(`${p}: ${m[1]}`);
  }
}

/* 8d · ES es traducción, no copia: ni truncada ni casi idéntica */
const PARITY = [];
const wordsOf = (html) =>
  new Set(
    stripNoise(mainRegion(html))
      .replace(/<[^>]+>/g, ' ')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .match(/[a-z]{3,}/g) || []
  );
const wordCount = (html) =>
  (stripNoise(mainRegion(html)).replace(/<[^>]+>/g, ' ').match(/\S+/g) || []).length;

for (const p of pages) {
  if (p.startsWith('es/')) continue;
  const twin = 'es/' + p;
  if (!pageSet.has(twin)) continue;
  const enSet = wordsOf(read(p));
  const esSet = wordsOf(read(twin));
  const enN = wordCount(read(p));
  const esN = wordCount(read(twin));
  if (!enN || !esN) continue;
  const ratio = esN / enN;
  const inter = [...enSet].filter((w) => esSet.has(w)).length;
  const jac = inter / Math.max(1, new Set([...enSet, ...esSet]).size);
  if (ratio < 0.7) PARITY.push(`${twin}: ${esN} palabras vs ${enN} en EN (ratio ${ratio.toFixed(2)}) — la versión ES está recortada`);
  if (jac > 0.45) PARITY.push(`${twin}: ${Math.round(jac * 100)}% de vocabulario compartido con EN — parece copia, no traducción`);
}

/* ---------- regla 9 · qué no hacer ---------- */
const errors = [];
const warnings = [];
const RULE9 = { hidden: [], nofollow: [], repeats: [], footer: [], dead: [] };
const MAX_SAME_TARGET = 10;
const WARN_SAME_TARGET = 6;

for (const p of pages) {
  const html = stripNoise(read(p));

  // a) enlaces ocultos o dentro de JS que no se renderiza
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    if (/aria-hidden="true"/i.test(attrs)) continue; // patrón a11y permitido
    const hidden =
      /\bhidden\b/i.test(attrs) ||
      /style="[^"]*(display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attrs);
    if (hidden) RULE9.hidden.push(`${p}: ${(/\bhref="([^"]*)"/i.exec(attrs) || [])[1] || '(sin href)'}`);
  }

  // b) nofollow interno
  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    if (!/rel="[^"]*nofollow/i.test(attrs)) continue;
    const href = (/\bhref="([^"]*)"/i.exec(attrs) || [])[1] || '';
    const target = resolve(p, href);
    if (target && pageSet.has(target)) RULE9.nofollow.push(`${p} → ${target}`);
  }

  // c) mismo destino repetido en la misma página
  const counts = new Map();
  for (const m of mainRegion(html).matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const t = resolve(p, m[1]);
    if (!t || !pageSet.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  for (const [t, n] of counts) {
    if (n > MAX_SAME_TARGET) RULE9.repeats.push(`${p}: ${n} enlaces a ${t} (máx ${MAX_SAME_TARGET})`);
    else if (n > WARN_SAME_TARGET) warnings.push(`${p}: ${n} enlaces al mismo destino ${t} (recomendado ≤ ${WARN_SAME_TARGET})`);
  }

  // d) footer que reparte enlaces a todo el sitio
  const footer = /<footer\b[\s\S]*?<\/footer>/i.exec(html);
  const header = /<header\b[\s\S]*?<\/header>/i.exec(html);
  if (footer) {
    const fTargets = new Set();
    for (const m of footer[0].matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
      const t = resolve(p, m[1]);
      if (t && pageSet.has(t)) fTargets.add(t);
    }
    const hTargets = new Set();
    if (header) {
      for (const m of header[0].matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
        const t = resolve(p, m[1]);
        if (t && pageSet.has(t)) hTargets.add(t);
      }
    }
    const extra = [...fTargets].filter((t) => !hTargets.has(t));
    if (extra.length) RULE9.footer.push(`${p}: el footer añade ${extra.length} destino(s) que no están en el nav — ${extra.join(', ')}`);
    if (fTargets.size > 8) RULE9.footer.push(`${p}: el footer enlaza a ${fTargets.size} destinos internos (máx 8)`);
  }
  // e) enlaces muertos (href="#") y enlaces rotos dentro del sitio
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)) {
    const href = m[1];
    if (href === '#') {
      RULE9.dead.push(`${p}: href="#" (enlace a la propia página)`);
      continue;
    }
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(href) || href.startsWith('#')) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const abs = clean.startsWith('/')
      ? path.join(ROOT, clean.slice(1))
      : path.join(ROOT, path.dirname(p), clean);
    if (!fs.existsSync(abs)) RULE9.dead.push(`${p}: enlace roto → ${clean}`);
  }
}

/* ---------- evaluación ---------- */

for (const p of pages) {
  const src = [...(inbound.get(p) || [])];
  const d = depth.has(p) ? depth.get(p) : Infinity;

  if (p !== HOME && !/^[^/]+\/index\.html$/.test(p)) {
    if (src.length < 3) {
      errors.push(`${p}: solo ${src.length} enlace(s) contextual(es) entrante(s) — mínimo 3${src.length ? ' (' + src.join(', ') + ')' : ''}`);
    }
    if (!src.some((s) => (depth.get(s) ?? Infinity) < d)) {
      errors.push(`${p}: ningún enlace entrante desde una página de nivel superior (profundidad ${d === Infinity ? '∞' : d})`);
    }
  }

  if (d > 3) errors.push(`${p}: profundidad ${d === Infinity ? '∞ (inalcanzable)' : d} — máximo 3 clics desde la home`);

  const out = contextualOut.get(p) || new Set();
  if (out.size < 3) errors.push(`${p}: solo ${out.size} enlace(s) contextual(es) saliente(s) — mínimo 3`);
  if (out.size > MAX_OUT && !LIST_PAGES.has(p)) {
    warnings.push(`${p}: ${out.size} enlaces contextuales (recomendado ≤ ${MAX_OUT})`);
  }

  for (const e of pageAnchorErrors.get(p) || []) errors.push(`${p}: ${e}`);
}

// regla 6
for (const [p, targets] of NOINDEX_LINK_REPORT) {
  errors.push(`${p}: enlaza a ${targets.length} página(s) noindex — ${targets.join(', ')} (callejón sin salida)`);
}

// regla 8
for (const c of CROSS) errors.push(`enlace que cruza de idioma en el cuerpo: ${c}`);
for (const s of SLUG_MISMATCH) errors.push(`slug de artículo sin pareja: ${s}`);
for (const c of CALQUES) errors.push(`ancla sin traducir en ES: ${c}`);
for (const a of ABSOLUTE) errors.push(`enlace absoluto en el cuerpo (usar ruta relativa): ${a}`);
for (const x of PARITY) errors.push(`paridad EN/ES: ${x}`);

// regla 9
for (const h of RULE9.hidden) errors.push(`enlace oculto: ${h}`);
for (const n of RULE9.nofollow) errors.push(`nofollow interno: ${n}`);
for (const r of RULE9.repeats) errors.push(`destino repetido: ${r}`);
for (const f of RULE9.footer) warnings.push(f);
for (const d of RULE9.dead) errors.push(`enlace muerto/roto: ${d}`);

// regla 7
for (const dir of localeDirs) {
  for (const [a, b] of CLUSTER_PAIRS) {
    const A = dir + a, B = dir + b;
    if (!pageSet.has(A) || !pageSet.has(B)) continue;
    if (!(contextualOut.get(A) || new Set()).has(B)) errors.push(`${A}: falta el enlace de cluster hacia ${B}`);
    if (!(contextualOut.get(B) || new Set()).has(A)) errors.push(`${B}: falta el enlace de cluster hacia ${A}`);
  }
}

// sobre-optimización del ancla a través de páginas
for (const [target, map] of anchorsFor) {
  for (const [text, sources] of map) {
    if (sources.size > MAX_SAME_ANCHOR_PAGES) {
      warnings.push(`«${text}» → ${target} se repite en ${sources.size} páginas (${[...sources].join(', ')}); variar el ancla`);
    }
  }
}

/* ---------- informe ---------- */
console.log('Link check — ' + pages.length + ' páginas indexables\n');
console.log('  página'.padEnd(46) + 'in  out  depth');
console.log('  ' + '─'.repeat(60));
for (const p of [...pages].sort((a, b) => (depth.get(a) ?? 99) - (depth.get(b) ?? 99))) {
  const n = (inbound.get(p) || new Set()).size;
  const o = (contextualOut.get(p) || new Set()).size;
  const d = depth.has(p) ? depth.get(p) : '∞';
  const flag = p !== HOME && !/^[^/]+\/index\.html$/.test(p) && n < 3 ? '  ⚠' : '';
  console.log('  ' + p.padEnd(44) + String(n).padStart(3) + String(o).padStart(5) + String(d).padStart(7) + flag);
}

if (warnings.length) {
  console.log('\nAvisos (' + warnings.length + '):');
  for (const w of warnings) console.log('  · ' + w);
}

if (errors.length) {
  console.log('\nErrores (' + errors.length + '):');
  for (const e of errors) console.log('  ✗ ' + e);
  console.log('\nFAIL — enlazado interno fuera de regla.');
  process.exit(1);
}

console.log('\nPASS — reglas 3, 4, 6, 7, 8 y 9 del mapa interlink.');
