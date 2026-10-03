#!/usr/bin/env node
/*
 * Central, idempotent SEO injector. For every real HTML page it owns a managed
 * block between <!-- seo:start --> and <!-- seo:end --> containing:
 *   - self-referencing canonical
 *   - reciprocal hreflang (en / es / x-default)
 *   - robots (index,follow) or (noindex,nofollow) for utility/demo pages
 *   - Open Graph + Twitter Card (title/description reused from the page)
 *   - JSON-LD @graph (Organization + Person + WebSite + page-specific nodes)
 *
 * Per-service Service/Offer/FAQ are built from assets/js/hire-data*.js (the
 * same source as the cart). Re-running the tool is safe: the block is replaced,
 * never appended.
 *
 *   node tools/apply-seo.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, join, posix } from 'node:path';
import { locale, langForPath, availableLangs, DEFAULT_LANG } from './locales.mjs';
import * as SEO from './seo.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/* ---------------- data ---------------- */
async function loadHire(file) {
  delete globalThis.JH_HIRE;
  await import(pathToFileURL(join(ROOT, file)).href);
  if (!globalThis.JH_HIRE) throw new Error('No JH_HIRE in ' + file);
  return JSON.parse(JSON.stringify(globalThis.JH_HIRE));
}
const HIRE = {};
for (const lang of availableLangs()) {
  HIRE[lang] = await loadHire(`assets/js/hire-data${locale(lang).dataSuffix}.js`);
}

async function loadBlog(file, key) {
  globalThis.window = globalThis;
  delete globalThis[key];
  await import(pathToFileURL(join(ROOT, file)).href + '?t=' + Date.now());
  return globalThis[key] || [];
}
const BLOG = {};
for (const lang of availableLangs()) {
  const suffix = locale(lang).dataSuffix;             // '' | '-es'
  const key = 'BLOG_POSTS' + (suffix ? '_' + suffix.slice(1).toUpperCase() : '');
  BLOG[lang] = await loadBlog(`assets/js/blog-data${suffix}.js`, key);
}
const SERVICE_BY_BASE = {}; // lang -> basename -> service
for (const lang of availableLangs()) {
  SERVICE_BY_BASE[lang] = {};
  for (const s of HIRE[lang].services) SERVICE_BY_BASE[lang][s.file.split('/').pop()] = s;
}

/* Session price, kept in sync with the booking cart (single source: class-booking.js). */
const SESSION_PRICE = Number((readFileSync(join(ROOT, 'assets/js/class-booking.js'), 'utf8')
  .match(/PRICE\s*=\s*(\d+(?:\.\d+)?)/) || [])[1]) || undefined;

/* ---------------- labels ---------------- */
const T = {
  en: { home: 'Home', services: 'Services', sessions: 'Sessions', clients: 'Clients', blog: 'Blog',
    faqMin: 'No lock-in. Choose 1, 3, 6 or 12 months and pause or cancel anytime.',
    faqBundle: 'Yes — hire several services and run them as one monthly system.',
    faqInclude: (cat) => `What does ${cat} include each month?`,
    faqCost: (cat) => `How much does ${cat} cost?`,
    faqMinQ: 'Is there a minimum contract?',
    faqBundleQ: 'Can I combine it with other services?' },
  es: { home: 'Inicio', services: 'Servicios', sessions: 'Sesiones', clients: 'Clientes', blog: 'Blog',
    faqMin: 'Sin permanencia. Elige 1, 3, 6 o 12 meses y pausa o cancela cuando quieras.',
    faqBundle: 'Sí — contrata varios servicios y llévalos como un solo sistema mensual.',
    faqInclude: (cat) => `¿Qué incluye ${cat} cada mes?`,
    faqCost: (cat) => `¿Cuánto cuesta ${cat}?`,
    faqMinQ: '¿Hay contrato mínimo?',
    faqBundleQ: '¿Puedo combinarlo con otros servicios?' }
};

/* ---------------- per-page config ---------------- */
const NOINDEX_BASES = new Set(['contract.html', 'contrato.html', 'gallery.html', 'blog-t.html', 'price-t.html']);
const isNoindex = (base) => NOINDEX_BASES.has(base) || /-hire\.html$/.test(base);

const RE_MANAGED = /[ \t]*<!-- seo:start -->[\s\S]*?<!-- seo:end -->\n?/;
const RE_CANON = /^[ \t]*<link rel="canonical"[^\n]*\n/gm;
const RE_ALT = /^[ \t]*<link rel="alternate" hreflang="(?:en|es|x-default)"[^\n]*\n/gm;
const RE_OG = /^[ \t]*<meta property="og:[^\n]*\n/gm;
const RE_TW = /^[ \t]*<meta name="twitter:[^\n]*\n/gm;
const RE_ROBOTS = /^[ \t]*<meta name="robots"[^\n]*\n/gm;
const RE_LD = /^[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/gm;

function decode(s) {
  return String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function attr(s) {
  return decode(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function readPage(html) {
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]).trim();
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]).trim();
  let ld = null;
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (m) { try { ld = JSON.parse(m[1]); } catch { /* ignore */ } }
  return { title, desc, ld };
}

function clientItems(html) {
  const out = [];
  for (const m of html.matchAll(/<article class="client-card( is-hidden)?">[\s\S]*?<\/article>/g)) {
    if (/is-hidden/.test(m[0])) continue;
    const name = (m[0].match(/class="client-name">([^<]+)/) || [])[1];
    const url = (m[0].match(/class="client-logo-link" href="([^"]+)"/) || [])[1];
    if (name && !out.some((o) => o.name === decode(name).trim())) {
      out.push({ name: decode(name).trim(), url });
    }
  }
  return out;
}

function pathOfLD(ld) {
  if (!ld || !ld.image) return null;
  return String(ld.image).replace(/^https?:\/\/[^/]+/, '');
}

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12', ene: '01', abr: '04', ago: '08', dic: '12' };
function isoDate(str) {
  const m = /(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñ]{3,})\s+(\d{4})/.exec(String(str));
  if (!m) return undefined;
  const mon = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (!mon) return undefined;
  return `${m[3]}-${mon}-${String(m[1]).padStart(2, '0')}`;
}

/* Resolve any href (relative or absolute) to a site-absolute path. */
function toSitePath(page, src) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src.replace(/^https?:\/\/[^/]+/, '');
  if (src.startsWith('/')) return src;
  return posix.resolve('/', posix.dirname(page.replace(/\\/g, '/')), src);
}

/* Blog post metadata parsed from the page itself (robust across re-runs). */
function blogMeta(page, html, info) {
  const headline = info.title.replace(/\s*·\s*SoyJacquesHauzeur.*$/, '').trim() || info.title;
  const hero = (html.match(/<div class="article-hero-media">\s*<img[^>]*src="([^"]+)"/) || [])[1]
    || (html.match(/<figure class="article-figure[^"]*">\s*<img[^>]*src="([^"]+)"/) || [])[1]
    || (html.match(/<article class="article-main">[\s\S]*?<img[^>]*src="([^"]+)"/) || [])[1];
  const eyebrow = (html.match(/<span class="eyebrow">[\s\S]*?<\/span>([^<]*)<\/span>/) || [, ''])[1];
  const author = (html.match(/class="author"[^>]*>\s*(?:By|Por)\s*([^<]+?)\s*</) || [, ''])[1];
  const category = (html.match(/<span class="category">([^<]+)<\/span>/) || [, ''])[1].trim() || undefined;
  const tags = [...new Set([...html.matchAll(/<div class="article-tags">([\s\S]*?)<\/div>/g)]
    .flatMap((m) => [...m[1].matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map((x) => decode(x[1]).trim()))
    .filter(Boolean))];
  const body = (html.match(/<article class="article-main">([\s\S]*?)<\/article>/) || [, ''])[1];
  const wordCount = body ? (SEO.plain(body).split(/\s+/).filter(Boolean).length || undefined) : undefined;
  return {
    headline,
    description: info.desc,
    image: toSitePath(page, hero),
    datePublished: isoDate(eyebrow),
    author: author.trim() || undefined,
    category,
    tags,
    wordCount
  };
}

function pageNodes(page, html, info) {
  const lang = langForPath(page);
  const t = T[lang];
  const base = page.split('/').pop();
  const logical = SEO.logicalOf(page);
  const title = info.title;
  const desc = info.desc;
  const wp = () => SEO.webPage(lang, page, { title, description: desc });

  if (isNoindex(base)) return [];
  if (logical === 'index.html') return [SEO.profilePage(lang, page, { title, description: desc })];

  if (logical === 'services.html') {
    const svcs = HIRE[lang].services;
    return [
      wp(),
      SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.services }]),
      SEO.offerCatalog(lang, svcs, SEO.canonicalUrl(page)),
      SEO.itemList(SEO.canonicalUrl(page) + '#services', t.services,
        svcs.map((s) => ({ name: s.category, url: SEO.urlFor(lang, s.file) })))
    ];
  }

  const svc = SERVICE_BY_BASE[lang][base];
  if (svc) {
    const url = SEO.canonicalUrl(page);
    const includes = svc.includes.join('; ');
    const faqs = [
      { q: t.faqInclude(svc.category), a: includes },
      { q: t.faqCost(svc.category), a: `USD $${svc.price}/month. ${HIRE[lang].labels.billingNote}` },
      { q: t.faqMinQ, a: t.faqMin },
      { q: t.faqBundleQ, a: t.faqBundle }
    ];
    return [
      wp(),
      SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.services, path: 'services.html' }, { name: svc.category }]),
      SEO.service(lang, svc, url),
      SEO.faq(lang, page, faqs)
    ];
  }

  if (/^(sessions|sesiones)\.html$/.test(base)) {
    return [wp(), SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.sessions }]),
      SEO.course(lang, page, { title, description: desc, price: SESSION_PRICE })];
  }

  if (base === 'clients.html') {
    const items = clientItems(html);
    return [wp(), SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.clients }]),
      SEO.collectionPage(lang, page, { title, description: desc, items })];
  }

  if (logical === 'blog.html') {
    const posts = (BLOG[lang] || []).map((p) => ({
      headline: p.title,
      url: SEO.SITE.origin + locale(lang).base + p.url,
      datePublished: isoDate(p.date)
    }));
    return [wp(), SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.blog }]),
      SEO.blog(lang, page, posts)];
  }

  // Blog post
  if (/^blog\/\d{4}\/\d{2}\/[^/]+\.html$/.test(logical) && base !== 'index.html') {
    const p = info.post || blogMeta(page, html, info);
    return [
      SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.blog, path: 'blog.html' }, { name: p.headline }]),
      SEO.blogPosting(lang, page, p)
    ];
  }

  // Blog monthly archive
  if (/^blog\/\d{4}\/\d{2}\/index\.html$/.test(logical)) {
    return [wp(), SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: t.blog, path: 'blog.html' }, { name: title }])];
  }

  // Generic page
  return [wp(), SEO.breadcrumb(lang, page, [{ name: t.home, path: 'index.html' }, { name: title }])];
}

function buildBlock(page, html, info) {
  const lang = langForPath(page);
  const noindex = isNoindex(page.split('/').pop());
  const canonical = SEO.canonicalUrl(page);
  const alt = SEO.alternates(page);
  const isPost = /^blog\/\d{4}\/\d{2}\/[^/]+\.html$/.test(SEO.logicalOf(page)) && !/\/index\.html$/.test(page);
  if (isPost) info.post = blogMeta(page, html, info);
  const nodes = [SEO.organization(), SEO.person(), SEO.website(lang), ...pageNodes(page, html, info)];

  const svc = SERVICE_BY_BASE[lang][page.split('/').pop()];
  let image = isPost && info.post.image ? SEO.abs(info.post.image) : SEO.abs(SEO.SITE.ogImage);
  if (!isPost && svc) image = SEO.abs(`/assets/og/${svc.file.replace(/\.html$/, '')}.${lang}.png`);
  const ogDim = !isPost ? [1200, 630] : null; // og-default + service cards are 1200×630
  const ogType = isPost ? 'article' : 'website';
  const ogLocale = lang === 'es' ? 'es_ES' : 'en_US';

  const L = [];
  L.push('<!-- seo:start -->');
  L.push(`  <link rel="canonical" href="${canonical}" />`);
  if (!noindex) {
    L.push(`  <link rel="alternate" hreflang="en" href="${alt.en}" />`);
    L.push(`  <link rel="alternate" hreflang="es" href="${alt.es}" />`);
    L.push(`  <link rel="alternate" hreflang="x-default" href="${alt.x}" />`);
  }
  L.push(`  <meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}" />`);
  L.push(`  <meta property="og:type" content="${ogType}" />`);
  L.push(`  <meta property="og:site_name" content="${SEO.SITE.name}" />`);
  L.push(`  <meta property="og:title" content="${attr(info.title)}" />`);
  L.push(`  <meta property="og:description" content="${attr(info.desc)}" />`);
  L.push(`  <meta property="og:url" content="${canonical}" />`);
  L.push(`  <meta property="og:image" content="${image}" />`);
  if (ogDim) {
    L.push(`  <meta property="og:image:width" content="${ogDim[0]}" />`);
    L.push(`  <meta property="og:image:height" content="${ogDim[1]}" />`);
  }
  L.push(`  <meta property="og:locale" content="${ogLocale}" />`);
  L.push(`  <meta name="twitter:card" content="summary_large_image" />`);
  L.push(`  <meta name="twitter:title" content="${attr(info.title)}" />`);
  L.push(`  <meta name="twitter:description" content="${attr(info.desc)}" />`);
  L.push(`  <meta name="twitter:image" content="${image}" />`);
  if (!noindex) L.push(SEO.scriptLD(SEO.graph(nodes)));
  L.push('  <!-- seo:end -->');
  return L.join('\n');
}

/* ---------------- run ---------------- */
const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*' -not -path './node_modules/*'",
  { encoding: 'utf8' }
).trim().split('\n').map((f) => f.replace(/^\.\//, '')).filter(Boolean).sort();

let changed = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const info = readPage(src);
  const block = buildBlock(file, src, info);

  let clean = src
    .replace(RE_MANAGED, '')
    .replace(RE_CANON, '')
    .replace(RE_ALT, '')
    .replace(RE_OG, '')
    .replace(RE_TW, '')
    .replace(RE_ROBOTS, '')
    .replace(RE_LD, '');

  let out;
  if (/<meta name="viewport"[^>]*>\n/.test(clean)) {
    out = clean.replace(/(<meta name="viewport"[^>]*>\n)/, (mm, p1) => p1 + block + '\n');
  } else if (/<head>\n/.test(clean)) {
    out = clean.replace(/(<head>\n)/, (mm, p1) => p1 + block + '\n');
  } else {
    console.log('skip (no <head>): ' + file);
    continue;
  }

  if (out !== src) { writeFileSync(file, out); changed++; console.log('seo -> ' + file); }
}
console.log('Done — ' + changed + ' file(s) updated.');
