#!/usr/bin/env node
/*
 * Applies the redesigned top navigation to the static top-level pages
 * (EN root + /es/). Nav order: Home · Clients · 1:1 · Services · About · Blog.
 * Rewrites the desktop nav-links, the mobile drawer anchors and the site footer.
 * The hire pages (services.html + 6 service pages) are regenerated separately by
 * build-hire-pages.mjs and must NOT be passed to this script.
 *
 *   node tools/apply-nav.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const EN = [
  ['index.html', 'Home'],
  ['clients.html', 'Clients'],
  ['studio.html', '1:1'],
  ['services.html', 'Services'],
  ['index.html#about', 'About me'],
  ['blog.html', 'Blog']
];

const ES = [
  ['index.html', 'Inicio'],
  ['clients.html', 'Clientes'],
  ['studio.html', '1:1'],
  ['services.html', 'Servicios'],
  ['index.html#about', 'Sobre mí'],
  ['blog.html', 'Blog']
];

const FOOTER_BRAND_EN =
  '<p>Technology education and done-for-you web &amp; marketing for founders, teams and companies — built to hand over, not to hold hostage.</p>\n' +
  '          <span class="label">Teaching · building · mentoring · worldwide</span>';
const FOOTER_BRAND_ES =
  '<p>Educación en tecnología y web y marketing llave en mano para fundadores, equipos y empresas — hechos para entregarte, no para tenerte de rehén.</p>\n' +
  '          <span class="label">Enseño · construyo · acompaño · en todo el mundo</span>';

function desktopInner(list, active) {
  return list
    .map(([h, l]) => '          <a href="' + h + '"' + (h === active ? ' aria-current="page"' : '') + '>' + l + '</a>')
    .join('\n');
}
function drawerLines(list) {
  return list.map(([h, l]) => '    <a href="' + h + '">' + l + '</a>');
}
function footerItems(list) {
  return list.map(([h, l]) => '            <li><a href="' + h + '">' + l + '</a></li>').join('\n');
}
function canonicalFooter(list, brand, metaLinks) {
  return (
    '  <footer class="site-footer">\n' +
    '    <div class="container container--wide">\n' +
    '      <div class="footer-top footer-top--minimal">\n' +
    '        <div class="footer-brand">\n' +
    '          <span class="brand"><span class="brand-mark" aria-hidden="true"></span> Jacques Hauzeur</span>\n' +
    '          ' + brand + '\n' +
    '        </div>\n' +
    '        <div>\n' +
    '          <h4>' + (metaLinks === 'es' ? 'Explorar' : 'Explore') + '</h4>\n' +
    '          <ul>\n' +
    footerItems(list) + '\n' +
    '          </ul>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      <div class="footer-bottom">\n' +
    '        <span class="footer-copy"><span class="ft-sign">©</span> <span class="ft-year">2026</span> <span class="ft-month"></span> <span class="ft-code">&lt;/&gt;</span> Jacques Hauzeur · SoyJacquesHauzeur</span>\n' +
    '        <div class="footer-meta-links">\n' +
    (metaLinks === 'es'
      ? '          <a href="#">Privacidad</a>\n          <a href="#">Aviso legal</a>\n          <a href="#">Mapa del sitio</a>\n'
      : '          <a href="#">Privacy</a>\n          <a href="#">Imprint</a>\n          <a href="#">Sitemap</a>\n') +
    '        </div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </footer>'
  );
}

function transform(path) {
  const list = path.startsWith('es/') ? ES : EN;
  const isES = path.startsWith('es/');
  let src = readFileSync(path, 'utf8');
  const orig = src;

  const activeMatch = src.match(/href="([^"]+\.html)"[^>]*aria-current="page"/);
  const active = activeMatch ? activeMatch[1] : null;

  // Desktop nav-links
  src = src.replace(
    /(<div class="nav-links" role="navigation">)([\s\S]*?)(<\/div>)/,
    (_m, a, _b, c) => a + '\n' + desktopInner(list, active) + '\n        ' + c
  );

  // Mobile drawer anchors (only the 4-space <a> run after the drawer open tag)
  {
    const lines = src.split('\n');
    const dIdx = lines.findIndex((l) => l.includes('id="mobile-drawer"'));
    const re = /^    <a href="[^"]+"[^>]*>[^<]*<\/a>\s*$/;
    let i = dIdx + 1;
    while (i < lines.length && !re.test(lines[i])) i++;
    const j0 = i;
    while (i < lines.length && re.test(lines[i])) i++;
    if (i > j0) lines.splice(j0, i - j0, ...drawerLines(list));
    src = lines.join('\n');
  }

  // Footer: replace Explore/Explorar list, or swap a legacy (Brivon) footer entirely
  if (src.includes('footer-top--minimal')) {
    src = src.replace(
      /(<h4>(?:Explore|Explorar)<\/h4>\s*<ul>)([\s\S]*?)(<\/ul>)/,
      (_m, a, _b, c) => a + '\n' + footerItems(list) + '\n          ' + c
    );
  } else {
    src = src.replace(
      /<footer class="site-footer">[\s\S]*?<\/footer>/,
      canonicalFooter(list, isES ? FOOTER_BRAND_ES : FOOTER_BRAND_EN, isES ? 'es' : 'en')
    );
  }

  if (src !== orig) {
    writeFileSync(path, src);
    console.log('updated ' + path);
  } else {
    console.log('unchanged ' + path);
  }
}

const FILES = [
  'index.html',
  'clients.html',
  'studio.html',
  'blog.html',
  'es/index.html',
  'es/clients.html',
  'es/studio.html',
  'es/blog.html'
];

for (const f of FILES) transform(f);
