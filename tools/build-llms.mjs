#!/usr/bin/env node
/*
 * build-llms.mjs — genera el/los llms.txt del sitio (spec llmstxt.org v2) a
 * partir de los datos del repo:
 *   - tools/locales.mjs      (idiomas activos, base y nav)
 *   - tools/seo.mjs          (SITE.origin)
 *   - assets/js/hire-data*.js (servicios + precios)
 *   - assets/js/blog-data*.js (posts)
 *
 * Salida: `llms.txt` (raíz, EN) y `es/llms.txt` (ES). Idempotente y determinista.
 *
 *   node tools/build-llms.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { SITE } from './seo.mjs';
import { availableLangs, locale } from './locales.mjs';

/* Ejecuta un script clásico (window.X = …) en un sandbox y devuelve el window. */
function evalScript(file) {
  const src = readFileSync(file, 'utf8');
  const sandbox = {};
  const fn = new Function('window', 'self', 'globalThis', 'document', src + '\n;return window;');
  return fn(sandbox, sandbox, sandbox, {});
}

const DATA = {
  en: { hire: evalScript('assets/js/hire-data.js').JH_HIRE, posts: evalScript('assets/js/blog-data.js').BLOG_POSTS },
  es: { hire: evalScript('assets/js/hire-data-es.js').JH_HIRE, posts: evalScript('assets/js/blog-data-es.js').BLOG_POSTS_ES }
};

const ORIGIN = SITE.origin;

function pageUrl(lang, file) {
  const t = locale(lang);
  const [path, hash] = String(file).split('#');
  const p = path === 'index.html' ? t.base : t.base + path;
  return ORIGIN + p + (hash ? '#' + hash : '');
}

const NOTE = {
  en: {
    'index.html': 'Who I am and what I do',
    'index.html#about': 'My background and approach',
    'clients.html': 'Clients and the results they run on',
    'sessions.html': 'Book paid 1:1 sessions (USD $15 / 90 min)',
    'services.html': 'The six monthly hires and rates',
    'blog.html': 'Notes on AI, web, marketing and chatbots'
  },
  es: {
    'index.html': 'Quién soy y qué hago',
    'index.html#about': 'Mi trayectoria y enfoque',
    'clients.html': 'Clientes y los resultados que consiguen',
    'sesiones.html': 'Agenda sesiones 1:1 de pago (USD $15 / 90 min)',
    'services.html': 'Los seis servicios mensuales y sus tarifas',
    'blog.html': 'Notas sobre IA, web, marketing y chatbots'
  }
};

const T = {
  en: {
    summary: 'Jacques Hauzeur (SoyJacquesHauzeur) is a technology educator and mentor for founders and teams — web, marketing, automation and AI. Services are monthly hires priced in USD (chargeable in local currency, e.g. COP); 1:1 sessions are USD $15 per 90-minute class. The site is available in English (/) and Spanish (/es/).',
    pages: 'Pages', services: 'Services (monthly hire, USD)', sessions: '1:1 sessions', blog: 'Blog', optional: 'Optional',
    perMonth: '/month', sessNote: 'USD $15 / 90-minute session',
    otherSite: 'Spanish site', otherSiteNote: 'Spanish version of the site',
    store: 'Store', storeNote: 'Product store (demo)',
    call: 'Book a video call', callNote: 'Schedule a call (Google Meet)'
  },
  es: {
    summary: 'Jacques Hauzeur (SoyJacquesHauzeur) es educador tecnológico y mentor de fundadores y equipos — web, marketing, automatización e IA. Los servicios son contrataciones mensuales con precios en USD (cobrables en moneda local, p. ej. COP); las sesiones 1:1 son USD $15 por clase de 90 min. El sitio está en inglés (/) y español (/es/).',
    pages: 'Páginas', services: 'Servicios (contratación mensual, USD)', sessions: 'Sesiones 1:1', blog: 'Blog', optional: 'Opcional',
    perMonth: '/mes', sessNote: 'USD $15 / sesión de 90 min',
    otherSite: 'Sitio en inglés', otherSiteNote: 'Versión en inglés del sitio',
    store: 'Tienda', storeNote: 'Tienda de producto (demo)',
    call: 'Reservar videollamada', callNote: 'Agendar una llamada (Google Meet)'
  }
};

const CALENDAR = 'https://calendar.app.google/DyS8yXtsb85ZD7kJ7';
const STORE = ORIGIN + '/es/tienda/index.html';

function excerpt(s, n = 150) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
}

function build(lang) {
  const t = T[lang];
  const d = DATA[lang];
  const L = [];
  L.push('# Jacques Hauzeur (SoyJacquesHauzeur)', '');
  L.push('> ' + t.summary, '');

  // Pages
  L.push('## ' + t.pages, '');
  for (const [file, label] of locale(lang).nav) {
    const note = NOTE[lang][file] || NOTE[lang][file.replace(/#.*$/, '')];
    L.push(`- [${label}](${pageUrl(lang, file)})${note ? ': ' + note : ''}`);
  }
  L.push('');

  // Services
  L.push('## ' + t.services, '');
  for (const s of d.hire.services) {
    L.push(`- [${s.category}](${ORIGIN}${locale(lang).base}${s.file}): USD $${s.price}${t.perMonth}`);
  }
  L.push('');

  // 1:1 sessions
  const sessFile = lang === 'es' ? 'sesiones.html' : 'sessions.html';
  L.push('## ' + t.sessions, '');
  L.push(`- [${t.sessions}](${pageUrl(lang, sessFile)}): ${t.sessNote}`);
  L.push('');

  // Blog
  L.push('## ' + t.blog, '');
  for (const p of d.posts) {
    const url = ORIGIN + locale(lang).base + p.url;
    L.push(`- [${p.title}](${url})${p.excerpt ? ': ' + excerpt(p.excerpt) : ''}`);
  }
  L.push('');

  // Optional
  L.push('## ' + t.optional, '');
  const other = lang === 'en' ? '/es/' : '/';
  L.push(`- [${t.otherSite}](${ORIGIN}${other}): ${t.otherSiteNote}`);
  L.push(`- [${t.store}](${STORE}): ${t.storeNote}`);
  L.push(`- [${t.call}](${CALENDAR}): ${t.callNote}`);
  L.push('');

  return L.join('\n').replace(/\n{3,}/g, '\n\n');
}

let n = 0;
for (const lang of availableLangs()) {
  if (!DATA[lang]) continue;
  const file = locale(lang).dir + 'llms.txt';
  writeFileSync(file, build(lang));
  console.log('llms -> ' + file);
  n++;
}
console.log('Done — ' + n + ' archivo(s).');
