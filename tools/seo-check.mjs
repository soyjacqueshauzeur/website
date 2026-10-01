#!/usr/bin/env node
/*
 * SEO guard — verifies the output of apply-seo.mjs + build-sitemap.mjs:
 * canonical, unique titles, robots, parseable JSON-LD with the Organization
 * node, reciprocal hreflang, and sitemap coverage. Exit 1 on failure.
 *
 *   node tools/seo-check.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { langForPath, DEFAULT_LANG } from './locales.mjs';
import * as SEO from './seo.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const NOINDEX_BASES = new Set(['contract.html', 'contrato.html', 'gallery.html', 'blog-t.html', 'price-t.html']);
const isNoindex = (base) => NOINDEX_BASES.has(base) || /-hire\.html$/.test(base);

const files = execSync(
  "find . -name '*.html' -not -path './.git/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*'",
  { encoding: 'utf8' }
).trim().split('\n').map((f) => f.replace(/^\.\//, '')).filter(Boolean).sort();

let ok = true;
const fail = (m) => { ok = false; console.error('  ✗ ' + m); };

const titles = new Map();
const canonicals = new Set();
const indexable = [];

for (const f of files) {
  const base = f.split('/').pop();
  const html = readFileSync(f, 'utf8');
  const noindex = isNoindex(base);
  const noSeoBlock = f.startsWith('.');
  if (!html.includes('<!-- seo:start -->')) { if (!noSeoBlock) fail(`${f}: falta bloque seo`); continue; }

  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [, ''])[1];
  const robots = (html.match(/<meta name="robots" content="([^"]+)"/) || [, ''])[1];
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  const ogImage = (html.match(/property="og:image" content="([^"]+)"/) || [, ''])[1];
  const ld = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [, ''])[1];

  if (!canonical) fail(`${f}: sin canonical`);
  else if (!canonical.includes(SEO.SITE.origin)) fail(`${f}: canonical con dominio ajeno (${canonical})`);
  if (!title) fail(`${f}: sin <title>`);
  if (!noindex && !desc) fail(`${f}: sin meta description`);

  if (!noindex) {
    if (!ogImage.startsWith(SEO.SITE.origin)) fail(`${f}: og:image con dominio ajeno (${ogImage})`);
    else {
      const rel = ogImage.slice(SEO.SITE.origin.length).replace(/^\//, '');
      if (!existsSync(join(ROOT, rel))) fail(`${f}: og:image no existe en disco (${rel})`);
    }
  }

  if (noindex) {
    if (robots !== 'noindex, nofollow') fail(`${f}: robots debe ser noindex,nofollow (es "${robots}")`);
  } else {
    if (robots !== 'index, follow') fail(`${f}: robots debe ser index,follow (es "${robots}")`);
    indexable.push({ f, canonical, title, html });
    canonicals.add(canonical);
    if (canonical) titles.set(title, (titles.get(title) || 0) + 1);
  }

  if (ld) {
    try {
      const obj = JSON.parse(ld);
      const graph = obj['@graph'] || [obj];
      if (!graph.some((n) => n['@type'] === 'Organization')) fail(`${f}: JSON-LD sin Organization`);
    } catch (e) { fail(`${f}: JSON-LD inválido (${e.message})`); }
  } else {
    fail(`${f}: sin JSON-LD`);
  }
}

for (const [t, n] of titles) if (n > 1) fail(`título duplicado ×${n}: "${t}"`);

/* hreflang reciprocity */
const byUrl = new Map(indexable.map((x) => [x.canonical, x.html]));
for (const { f, canonical, html } of indexable) {
  const others = [...html.matchAll(/<link rel="alternate" hreflang="(en|es|x-default)" href="([^"]+)"/g)];
  if (!others.length) { fail(`${f}: sin hreflang alternates`); continue; }
  for (const [, hl, href] of others) {
    if (!href.startsWith(SEO.SITE.origin)) fail(`${f}: hreflang ${hl} a dominio ajeno (${href})`);
  }
  const alt = SEO.alternates(f);
  for (const url of [alt.en, alt.es]) {
    const oh = byUrl.get(url);
    if (!oh) { fail(`${f}: hreflang apunta a ${url} sin página indexable`); continue; }
    if (!oh.includes(`href="${canonical}"`)) fail(`${f}: hreflang no recíproco con ${url}`);
  }
}

/* sitemap coverage */
if (!existsSync(`${ROOT}/sitemap.xml`)) fail('falta sitemap.xml');
else {
  const sm = readFileSync(`${ROOT}/sitemap.xml`, 'utf8');
  for (const c of canonicals) {
    if (!sm.includes(`<loc>${c}</loc>`)) fail(`sitemap.xml no incluye ${c}`);
  }
  for (const b of NOINDEX_BASES) {
    if (sm.includes(`<loc>${SEO.SITE.origin}/${b}</loc>`)) fail(`sitemap.xml incluye página noindex ${b}`);
  }
}

console.log(ok ? '\nPASS — SEO consistente (canonical, robots, JSON-LD, hreflang, sitemap).' : '\nFAIL — hay problemas SEO.');
process.exit(ok ? 0 : 1);
