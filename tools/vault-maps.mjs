#!/usr/bin/env node
/*
 * vault-maps.mjs — genera en el vault las dos notas de mapa REAL de la web
 * (EN y ES) a partir del HTML construido, no de la intención.
 *
 *   interlink/04 · Mapa EN.md
 *   interlink/05 · Mapa ES.md
 *
 * Cada mapa enlaza con wikilinks a las notas de página de interlink/paginas
 * y a las notas de artículo de blog/, así que el grafo de Obsidian dibuja
 * cómo quedó el sitio en cada idioma.
 *
 * Uso: node tools/vault-maps.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VAULT = 'assets/soyjacqueshauzeur-vault';
const SITE = 'https://soyjacqueshauzeur.dev/';
const EXCLUDE = new Set(['404.html', 'es/404.html', 'contract.html', 'es/contrato.html', 'gallery.html', 'blog-t.html', 'price-t.html']);
const HOME = 'index.html';

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const strip = (h) =>
  h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
const main = (h) => (/<main\b[\s\S]*?<\/main>/i.exec(h) || [''])[0];

function resolve(from, href) {
  if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || /\.(css|js|png|jpe?g|webp|avif|svg|ico|woff2?|xml|txt|json|pdf)$/i.test(clean)) return null;
  let t;
  if (clean.startsWith('/')) t = path.posix.normalize(clean.slice(1));
  else {
    const base = path.posix.dirname(from);
    t = path.posix.normalize(path.posix.join(base === '.' ? '' : base, clean));
  }
  if (t.endsWith('/')) t += 'index.html';
  return t.endsWith('.html') ? t.replace(/^\.\//, '') : null;
}

/* ---------- universo ---------- */
const sitemap = read('sitemap.xml');
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].trim())
  .filter((u) => u.startsWith(SITE))
  .map((u) => {
    const rel = u.slice(SITE.length);
    return !rel || rel.endsWith('/') ? rel + 'index.html' : rel;
  })
  .filter((p) => !EXCLUDE.has(p));
const pageSet = new Set(pages);

/* ---------- grafo ---------- */
const out = new Map();
const inn = new Map();
const words = new Map();
const titles = new Map();

for (const p of pages) {
  const html = read(p);
  const body = strip(main(html));
  const set = new Set();
  for (const m of body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (/aria-hidden="true"/i.test(m[1])) continue;
    const t = resolve(p, (/\bhref="([^"]*)"/i.exec(m[1]) || [])[1]);
    if (t && pageSet.has(t) && t !== p) set.add(t);
  }
  out.set(p, set);
  for (const t of set) {
    if (!inn.has(t)) inn.set(t, new Set());
    inn.get(t).add(p);
  }
  words.set(p, (body.replace(/<[^>]+>/g, ' ').match(/\S+/g) || []).length);
  const t = /<title>(.*?)<\/title>/is.exec(html);
  titles.set(p, t ? t[1].replace(/&amp;/g, '&').trim() : '');
}

/* profundidad por idioma */
const roots = pages.filter((p) => p === HOME || /^[^/]+\/index\.html$/.test(p));
const depth = new Map(roots.map((r) => [r, 0]));
const q = [...roots];
const all = new Map();
for (const p of pages) {
  const h = strip(read(p));
  const s = new Set();
  for (const m of h.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const t = resolve(p, m[1]);
    if (t && pageSet.has(t)) s.add(t);
  }
  all.set(p, s);
}
while (q.length) {
  const cur = q.shift();
  for (const t of all.get(cur) || []) {
    if (!depth.has(t)) { depth.set(t, depth.get(cur) + 1); q.push(t); }
  }
}

/* ---------- nombres de nota ---------- */
const NOTE = {
  'index.html': 'home',
  'services.html': 'services',
  'clients.html': 'clients',
  'sessions.html': 'sessions',
  'sesiones.html': 'sessions',
  'blog.html': 'blog-listing',
};
const bare = (p) => (p.startsWith('es/') ? p.slice(3) : p);
const noteOf = (p) => NOTE[bare(p)] || path.posix.basename(bare(p), '.html');

const GROUP = {
  home: 'Nivel 0 · raíz',
  services: 'Nivel 1 · hubs',
  clients: 'Nivel 1 · hubs',
  sessions: 'Nivel 1 · hubs',
  'blog-listing': 'Nivel 1 · hubs',
  marketing: 'Nivel 2 · servicios',
  campaigns: 'Nivel 2 · servicios',
  chatbots: 'Nivel 2 · servicios',
  ai: 'Nivel 2 · servicios',
  ecommerce: 'Nivel 2 · servicios',
  'financial-planning': 'Nivel 2 · servicios',
};
const groupOf = (p) => GROUP[noteOf(p)] || 'Nivel 3 · artículos';

const urlOf = (p) => (p === 'index.html' ? '/' : p === 'es/index.html' ? '/es/' : '/' + p);
const langOf = (p) => (p.startsWith('es/') ? 'es' : 'en');
const label = (p) => `[[${noteOf(p)}]]`;

/* ---------- render ---------- */
function build(lang) {
  const list = pages.filter((p) => langOf(p) === lang).sort((a, b) => {
    const d = (depth.get(a) ?? 99) - (depth.get(b) ?? 99);
    return d !== 0 ? d : a.localeCompare(b);
  });

  const groups = new Map();
  for (const p of list) {
    const g = groupOf(p);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(p);
  }

  const order = ['Nivel 0 · raíz', 'Nivel 1 · hubs', 'Nivel 2 · servicios', 'Nivel 3 · artículos'];
  const L = [];
  const flag = lang === 'en' ? '🇬🇧' : '🇪🇸';
  const name = lang === 'en' ? 'EN' : 'ES';
  const prefix = lang === 'es' ? 'es/' : '';

  L.push('---');
  L.push(`title: "Mapa real · ${name}"`);
  L.push('tipo: mapa');
  L.push(`lang: ${lang}`);
  L.push(`tags: [mapa/${lang}]`);
  L.push('generado: tools/vault-maps.mjs');
  L.push('---');
  L.push('');
  L.push(`# ${flag} Mapa de la web — ${name} (estado real)`);
  L.push('');
  L.push(`> Generado desde el HTML construido, no desde el diseño. **${list.length} URLs indexables** en este idioma.`);
  L.push('> Las notas de página son compartidas por los dos idiomas; lo que cambia aquí es la URL.');
  L.push('');
  L.push('## Árbol');
  L.push('');
  L.push('```');
  L.push(`${urlOf(prefix + 'index.html')}`);
  for (const p of list) {
    if (p === prefix + 'index.html') continue;
    const d = depth.get(p) ?? '∞';
    L.push(`${'  '.repeat(d)}├─ ${urlOf(p)}`);
  }
  L.push('```');
  L.push('');

  for (const g of order) {
    const items = groups.get(g);
    if (!items) continue;
    L.push(`## ${g}`);
    L.push('');
    L.push('| Página | URL | Palabras | Entrantes | Salientes |');
    L.push('|---|---|---|---|---|');
    for (const p of items) {
      L.push(
        `| ${label(p)} | \`${urlOf(p)}\` | ${words.get(p)} | ${(inn.get(p) || new Set()).size} | ${(out.get(p) || new Set()).size} |`
      );
    }
    L.push('');
  }

  L.push('## Quién enlaza a cada página');
  L.push('');
  for (const p of list) {
    const sources = [...(inn.get(p) || [])].filter((s) => langOf(s) === lang);
    L.push(`### ${label(p)} — \`${urlOf(p)}\``);
    L.push('');
    L.push(`**${sources.length} enlaces entrantes**${sources.length ? ': ' + sources.map(label).join(' · ') : ''}`);
    L.push('');
    const targets = [...(out.get(p) || [])].filter((t) => langOf(t) === lang);
    if (targets.length) {
      L.push(`Sale hacia: ${targets.map(label).join(' · ')}`);
      L.push('');
    }
  }

  L.push('## Cómo se ve el otro idioma');
  L.push('');
  L.push(lang === 'en' ? '[[05 · Mapa ES]]' : '[[04 · Mapa EN]]');
  L.push('');
  L.push('Reglas que gobiernan este mapa: [[01 · Reglas de enlazado]] · índice: [[00 · Índice interlink]]');
  L.push('');

  const file = path.join(ROOT, VAULT, 'interlink', lang === 'en' ? '04 · Mapa EN.md' : '05 · Mapa ES.md');
  fs.writeFileSync(file, L.join('\n'));
  return { file: path.relative(ROOT, file), n: list.length };
}

const a = build('en');
const b = build('es');
console.log(`  ✓ ${a.file} (${a.n} URLs)`);
console.log(`  ✓ ${b.file} (${b.n} URLs)`);
