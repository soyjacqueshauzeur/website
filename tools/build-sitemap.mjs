#!/usr/bin/env node
/*
 * Generates sitemap.xml (with hreflang alternates) and robots.txt from the
 * locale registry + the page inventory. Excludes noindex/utility pages.
 *
 *   node tools/build-sitemap.mjs
 */
import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { langForPath, availableLangs, locale, DEFAULT_LANG } from './locales.mjs';
import * as SEO from './seo.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const NOINDEX_BASES = new Set(['contract.html', 'contrato.html', 'gallery.html', 'blog-t.html', 'price-t.html']);
const isNoindex = (base) => NOINDEX_BASES.has(base) || /-hire\.html$/.test(base);

const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*'",
  { encoding: 'utf8' }
).trim().split('\n').map((f) => f.replace(/^\.\//, '')).filter(Boolean);

function priority(logical) {
  if (logical === 'index.html') return ['1.0', 'weekly'];
  if (logical === 'services.html') return ['0.9', 'monthly'];
  if (/^(marketing|campaigns|chatbots|ai|financial-planning|ecommerce)\.html$/.test(logical)) return ['0.9', 'monthly'];
  if (/^(sessions|sesiones|clients)\.html$/.test(logical)) return ['0.8', 'monthly'];
  if (logical === 'blog.html') return ['0.7', 'weekly'];
  if (/^blog\/\d{4}\/\d{2}\/[^/]+\.html$/.test(logical)) return ['0.6', 'yearly'];
  if (/^blog\/\d{4}\/\d{2}\/index\.html$/.test(logical)) return ['0.5', 'monthly'];
  return ['0.6', 'monthly'];
}

// Unique logical pages (EN naming) that are indexable.
const logicals = new Map(); // logical -> { file }
for (const f of files) {
  const base = f.split('/').pop();
  if (isNoindex(base)) continue;
  const logical = SEO.logicalOf(f);
  if (!logicals.has(logical)) logicals.set(logical, { file: f });
}

const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const [logical, { file }] of [...logicals.entries()].sort()) {
  const alt = SEO.alternates(file);
  const [prio, freq] = priority(logical);
  for (const lang of availableLangs()) {
    const loc = SEO.urlFor(lang, logical);
    let lastmod = today;
    const langFile = join(ROOT, locale(lang).dir + logical);
    try { lastmod = statSync(langFile).mtime.toISOString().slice(0, 10); } catch { /* ignore */ }
    urls.push(
      '  <url>\n' +
      `    <loc>${loc}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${freq}</changefreq>\n` +
      `    <priority>${prio}</priority>\n` +
      `    <xhtml:link rel="alternate" hreflang="en" href="${alt.en}" />\n` +
      `    <xhtml:link rel="alternate" hreflang="es" href="${alt.es}" />\n` +
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${alt.x}" />\n` +
      '  </url>'
    );
  }
}

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  urls.join('\n') + '\n</urlset>\n';
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap);
console.log(`wrote sitemap.xml (${urls.length} URLs)`);

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /blog-t.html',
  'Disallow: /gallery.html',
  'Disallow: /price-t.html',
  '',
  `Sitemap: ${SEO.SITE.origin}/sitemap.xml`,
  ''
].join('\n');
writeFileSync(join(ROOT, 'robots.txt'), robots);
console.log('wrote robots.txt');
