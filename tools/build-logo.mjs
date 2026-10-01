#!/usr/bin/env node
/*
 * Rasterises the brand mark (assets/favicon.svg) into the PNG sizes used for
 * schema.org Organization.logo and Open Graph / Twitter cards.
 *
 *   node tools/build-logo.mjs
 *
 * Output:
 *   assets/logo.png        512×512   (Organization.logo)
 *   assets/logo-1920.png   1920×1920 (high-res)
 *   assets/og-default.png  1200×630  (default social card)
 *
 * Requires Inkscape (SVG rasteriser). Fonts fall back to Liberation Mono /
 * DejaVu Sans Mono, which the SVG already lists.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, 'assets/favicon.svg');

function render(svgPath, outPath, w, h) {
  execFileSync('inkscape', [
    svgPath,
    `--export-filename=${outPath}`,
    `--export-width=${w}`,
    `--export-height=${h}`
  ], { stdio: 'inherit' });
}

const svg = readFileSync(SRC, 'utf8');
if (!/width="512"/.test(svg)) throw new Error('Unexpected favicon.svg — expected a 512 viewBox');

render(SRC, join(ROOT, 'assets/logo.png'), 512, 512);
render(SRC, join(ROOT, 'assets/logo-1920.png'), 1920, 1920);

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#050507"/>
  <rect x="470" y="96" width="260" height="260" rx="38" fill="#D4FF3D"/>
  <text x="600" y="226" text-anchor="middle" dominant-baseline="central"
        font-family="'Liberation Mono','DejaVu Sans Mono',monospace"
        font-weight="700" font-size="142" letter-spacing="-6" fill="#050507">{}</text>
  <text x="600" y="452" text-anchor="middle"
        font-family="'DejaVu Sans','Liberation Sans',sans-serif"
        font-weight="700" font-size="66" fill="#FFFFFF">Jacques Hauzeur</text>
  <text x="600" y="516" text-anchor="middle"
        font-family="'Liberation Mono','DejaVu Sans Mono',monospace"
        font-size="30" letter-spacing="2" fill="#D4FF3D">soyjacqueshauzeur.dev</text>
</svg>
`;
const ogTmp = join(ROOT, 'assets', '.og-default.svg');
writeFileSync(ogTmp, OG_SVG);
try {
  render(ogTmp, join(ROOT, 'assets/og-default.png'), 1200, 630);
} finally {
  rmSync(ogTmp, { force: true });
}

console.log('Done — wrote assets/logo.png, assets/logo-1920.png, assets/og-default.png');
