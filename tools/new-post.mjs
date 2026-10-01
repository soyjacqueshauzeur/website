#!/usr/bin/env node
/*
 * Scaffold a new journal post in both languages and register it in the
 * blog data files (single source of truth).
 *
 *   node tools/new-post.mjs --slug mi-nota --title "Título EN" --excerpt "Resumen EN" \
 *     [--title-es "Título ES"] [--excerpt-es "Resumen ES"] \
 *     [--image assets/img/journal-light.webp] [--category process] \
 *     [--author "Jacques Hauzeur"] [--read "5 min"] [--date "26 Sep 2026"] \
 *     [--body "…"] [--body-es "…"] [--featured]
 *
 * Output (fecha derivada de --date, p.ej. 2026/07):
 *   blog/<year>/<month>/<slug>.html      (EN)
 *   es/blog/<year>/<month>/<slug>.html   (ES)
 * and prepends the entry to assets/js/blog-data.js + blog-data-es.js.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { locale, availableLangs, assetPrefix, DEFAULT_LANG } from './locales.mjs';

const ORIGIN = 'https://soyjacqueshauzeur.dev';

function parseArgs(argv) {
  const out = { featured: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'featured') { out.featured = true; continue; }
    out[key] = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const slug = args.slug;
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Falta --slug (kebab-case, ej. --slug mi-nota).');
  process.exit(1);
}
const title = args.title;
const excerpt = args.excerpt;
if (!title || !excerpt) {
  console.error('Faltan --title y --excerpt.');
  process.exit(1);
}
const titleEs = args['title-es'] || title;
const excerptEs = args['excerpt-es'] || excerpt;
const image = (args.image || 'assets/img/journal-light.webp').replace(/^\.\.\//, '');
const category = args.category || 'process';
const author = args.author || 'Jacques Hauzeur';
const read = args.read || '5 min';

const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();
const date = args.date || `${String(now.getDate()).padStart(2,'0')} ${MON[now.getMonth()]} ${now.getFullYear()}`;
const iso = (() => { const m = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(String(date).trim()); if (!m) return now.toISOString().slice(0,10); return `${m[3]}-${String(MON.indexOf(m[2].replace(/^./,c=>c.toUpperCase())) + 1).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`; })();
const ym = `${iso.slice(0,4)}/${iso.slice(5,7)}`; // p.ej. 2026/07

const body = args.body || 'Escribe aquí el contenido de la nota.';
const bodyEs = args['body-es'] || args.body || 'Escribe aquí el contenido de la nota.';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function html({ lang, title: t, excerpt: ex, cat, body: b, prefix, url, imagePath }) {
  const alts = availableLangs()
    .map((k) => `  <link rel="alternate" hreflang="${locale(k).hreflang}" href="${ORIGIN}${locale(k).base}blog/${ym}/${slug}.html" />`)
    .join('\n');
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="${prefix}/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="${prefix}/favicon.ico" sizes="any" />
  <link rel="apple-touch-icon" href="${prefix}/apple-touch-icon.png" />
  <title>${esc(t)} · SoyJacquesHauzeur Blog</title>
  <meta name="description" content="${esc(ex)}" />
  <link rel="canonical" href="${url}" />
${alts}
  <link rel="alternate" hreflang="x-default" href="${ORIGIN}${locale(DEFAULT_LANG).base}blog/${ym}/${slug}.html" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(t)}" />
  <meta property="og:description" content="${esc(ex)}" />
  <meta property="og:image" content="${ORIGIN}/${image}" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: t.replace(/\.$/, ''), description: ex, image: `${ORIGIN}/${image}`,
    datePublished: iso, author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: 'SoyJacquesHauzeur' },
    mainEntityOfPage: url
  })}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Boldonse&family=Inter+Tight:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" />
  <link rel="stylesheet" href="${prefix}/css/styles.css" />
  <link rel="stylesheet" href="${prefix}/css/blog.css" />
</head>
<body>
  <main id="main">
    <article class="article">
      <header class="article-head">
        <span class="label">${esc(cat)}</span>
        <h1>${esc(t)}</h1>
        <p class="article-meta">${esc(author)} · ${esc(read)} · ${esc(date)}</p>
        <p class="lede">${esc(ex)}</p>
        <img src="${imagePath}" alt="" loading="lazy" />
      </header>
      <div class="article-body">
        <p>${esc(b)}</p>
      </div>
    </article>
  </main>
  <script src="${prefix}/js/site.js" defer></script>
  <script src="${prefix}/js/blog${locale(lang).dataSuffix}.js" defer></script>
</body>
</html>
`;
}

function writePost(file, content) {
  if (existsSync(file)) { console.error('Ya existe: ' + file); process.exit(1); }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log('wrote ' + file);
}

writePost(`${locale('en').dir}blog/${ym}/${slug}.html`, html({
  lang: 'en', title, excerpt, cat: category, body, prefix: assetPrefix('en', 3),
  url: `${ORIGIN}/blog/${ym}/${slug}.html`, imagePath: '../../../' + image
}));
writePost(`${locale('es').dir}blog/${ym}/${slug}.html`, html({
  lang: 'es', title: titleEs, excerpt: excerptEs, cat: category, body: bodyEs, prefix: assetPrefix('es', 3),
  url: `${ORIGIN}/es/blog/${ym}/${slug}.html`, imagePath: '../../../../' + image
}));

function prependEntry(lang, obj) {
  const suffix = locale(lang).dataSuffix;               // '' | '-es'
  const file = `assets/js/blog-data${suffix}.js`;
  const globalName = 'BLOG_POSTS' + (suffix ? '_' + suffix.slice(1).toUpperCase() : '');
  const marker = `window.${globalName} = [`;
  const src = readFileSync(file, 'utf8');
  const at = src.indexOf(marker) + marker.length;
  if (at < marker.length) { console.error('No encuentro ' + marker + ' en ' + file); process.exit(1); }
  const indent = src.match(/=\s*\[\s*\n(\s+)/)?.[1] || '    ';
  const json = JSON.stringify(obj, null, 2).replace(/\n/g, '\n' + indent);
  const entry = '\n' + indent + json + ',';
  writeFileSync(file, src.slice(0, at) + entry + src.slice(at));
  console.log('entry -> ' + file);
}

const base = { slug, title, excerpt, category, date, author, readTime: read, image, featured: !!args.featured };
prependEntry('en', { ...base, url: `blog/${ym}/${slug}.html` });
prependEntry('es', { ...base, title: titleEs, excerpt: excerptEs, url: `blog/${ym}/${slug}.html` });

console.log('Listo. Edita los HTML para escribir el contenido y revisa blog-data*.js.');
