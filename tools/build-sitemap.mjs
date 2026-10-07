#!/usr/bin/env node
/*
 * Sitemap + robots.txt generator, aligned with Google Search Central:
 *   - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 *   - https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
 *
 * Rules implemented:
 *   - Only canonical, indexable URLs (noindex/utility pages are excluded).
 *   - Fully-qualified absolute URLs, UTF-8, XML entity escaping.
 *   - Each URL declares its en / es / x-default alternates (xhtml:link).
 *   - <lastmod> is verifiable: last git commit that touched the page, with the
 *     file mtime as fallback. Google ignores <priority>/<changefreq>, so they
 *     are not emitted.
 *   - If the inventory exceeds 50,000 URLs or 50 MB, it is split into
 *     sitemap-N.xml parts and sitemap.xml becomes a <sitemapindex>.
 *
 *   node tools/build-sitemap.mjs
 */
import { writeFileSync, statSync, readFileSync } from 'node:fs';
import { execSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as SEO from './seo.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const NOINDEX_BASES = new Set(['contract.html', 'contrato.html', 'gallery.html', 'blog-t.html', 'price-t.html']);
const isNoindex = (base) => NOINDEX_BASES.has(base) || /-hire\.html$/.test(base);

/* Además de la lista fija, respeta el <meta name="robots" content="noindex"> de cada página. */
function pageIsNoindex(file) {
  try {
    const src = readFileSync(join(ROOT, file), 'utf8');
    const metas = src.match(/<meta\b[^>]*name=["']robots["'][^>]*>/gi) || [];
    return metas.some((m) => /noindex/i.test(m));
  } catch { return false; }
}

const MAX_URLS = Number(process.env.SITEMAP_MAX_URLS) || 50000;   // sitemaps.org limit
const MAX_BYTES = Number(process.env.SITEMAP_MAX_BYTES) || 50 * 1024 * 1024; // 50 MB uncompressed

const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*' -not -path './node_modules/*'",
  { encoding: 'utf8' }
).trim().split('\n').map((f) => f.replace(/^\.\//, '')).filter(Boolean).sort();

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/* Verifiable lastmod: last commit that touched the page, else file mtime. */
function lastMod(file) {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  } catch { /* not a git repo or untracked file */ }
  try { return statSync(join(ROOT, file)).mtime.toISOString().slice(0, 10); } catch { return undefined; }
}

/* One entry per real, indexable file — guarantees only existing URLs. */
const entries = [];
for (const file of files) {
  if (isNoindex(file.split('/').pop()) || pageIsNoindex(file)) continue;
  entries.push({ loc: SEO.canonicalUrl(file), lastmod: lastMod(file), alt: SEO.alternates(file) });
}

function urlset(list) {
  const body = list.map((e) => {
    const lines = ['  <url>', `    <loc>${esc(e.loc)}</loc>`];
    if (e.lastmod) lines.push(`    <lastmod>${e.lastmod}</lastmod>`);
    for (const [hl, href] of [['en', e.alt.en], ['es', e.alt.es], ['x-default', e.alt.x]]) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${hl}" href="${esc(href)}" />`);
    }
    lines.push('  </url>');
    return lines.join('\n');
  }).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    body + '\n</urlset>\n';
}

function sitemapIndex(parts) {
  const body = parts.map((p) => {
    const lines = ['  <sitemap>', `    <loc>${esc(SEO.SITE.origin + '/' + p.file)}</loc>`];
    if (p.lastmod) lines.push(`    <lastmod>${p.lastmod}</lastmod>`);
    lines.push('  </sitemap>');
    return lines.join('\n');
  }).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body + '\n</sitemapindex>\n';
}

/* Split into parts respecting both limits. */
function chunk(list) {
  const parts = [];
  let cur = [];
  let bytes = 0;
  for (const e of list) {
    const size = Buffer.byteLength(urlset([e]), 'utf8');
    if (cur.length && (cur.length >= MAX_URLS || bytes + size > MAX_BYTES)) {
      parts.push(cur); cur = []; bytes = 0;
    }
    cur.push(e); bytes += size;
  }
  if (cur.length) parts.push(cur);
  return parts;
}

const parts = chunk(entries);
if (parts.length <= 1) {
  writeFileSync(join(ROOT, 'sitemap.xml'), urlset(entries));
  console.log(`wrote sitemap.xml (${entries.length} URLs)`);
} else {
  const refs = parts.map((p, i) => {
    const file = `sitemap-${i + 1}.xml`;
    writeFileSync(join(ROOT, file), urlset(p));
    return { file, lastmod: p.map((x) => x.lastmod).filter(Boolean).sort().pop() };
  });
  writeFileSync(join(ROOT, 'sitemap.xml'), sitemapIndex(refs));
  console.log(`wrote sitemap.xml index + ${parts.length} parts (${entries.length} URLs)`);
}

/*
 * robots.txt: crawl everything; removal from the index is handled by the
 * per-page `<meta name="robots" content="noindex, nofollow">` (blocking those
 * URLs here would prevent Google from ever seeing the noindex).
 */
const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${SEO.SITE.origin}/sitemap.xml`,
  ''
].join('\n');
writeFileSync(join(ROOT, 'robots.txt'), robots);
console.log('wrote robots.txt');
