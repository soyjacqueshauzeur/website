#!/usr/bin/env node
/*
 * Ensures every HTML page has the site favicon links (black square + lime
 * rounded square + `{}`). Idempotent: updates the block if the relative
 * assets prefix is wrong, skips pages that already match.
 *
 *   node tools/apply-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { faviconHTML } from './site-shell.mjs';
import { locale, langForPath, assetPrefix } from './locales.mjs';

const FAVICON_RE = /^[ \t]*<link rel="icon"[^\n]*\n/gm;
const APPLE_RE = /^[ \t]*<link rel="apple-touch-icon"[^\n]*\n/gm;

const files = execSync(
  "find . -name '*.html' -not -path './node_modules/*' -not -path './.playwright-mcp/*' -not -path './graphify-out/*' -not -path './.git/*'",
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

function prefixFor(file) {
  const clean = file.replace(/^\.\//, '').replace(/^\/+/, '');
  const lang = langForPath(clean);
  const within = clean.slice(locale(lang).dir.length);
  const depth = within.split('/').length - 1;
  return assetPrefix(lang, depth);
}

let changed = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const block = faviconHTML(prefixFor(file));
  const clean = src.replace(FAVICON_RE, '').replace(APPLE_RE, '');

  let out;
  if (/<meta name="viewport"[^>]*>\n/.test(clean)) {
    out = clean.replace(/(<meta name="viewport"[^>]*>\n)/, '$1' + block + '\n');
  } else if (/<head>\n/.test(clean)) {
    out = clean.replace(/(<head>\n)/, '$1' + block + '\n');
  } else {
    console.log('skip (no <head>): ' + file);
    continue;
  }

  if (out !== src) {
    writeFileSync(file, out);
    changed++;
    console.log('favicon -> ' + file);
  }
}
console.log('Done — ' + changed + ' file(s) updated.');
