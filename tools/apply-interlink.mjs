#!/usr/bin/env node
/*
 * apply-interlink.mjs — aplica el mapa de enlazado interno (vault: interlink/).
 *
 * El problema que resuelve: las tarjetas de servicio, el listado del blog y los
 * tags de clientes se pintan por JS. Google recibe HTML sin enlaces → páginas
 * huérfanas. Este tool escribe un *fallback estático* dentro de los mismos
 * contenedores que el JS rellena después (el JS hace innerHTML = '', así que el
 * fallback nunca se ve duplicado en el navegador).
 *
 * Bloques que escribe (idempotentes, delimitados por comentarios):
 *   <!-- il:cards:start/end -->  tarjetas de servicio estáticas
 *   <!-- il:posts:start/end -->  tarjetas de artículo estáticas
 *   <!-- il:links:start/end -->  bloques de enlaces relacionados
 *
 * Uso: node tools/apply-interlink.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { LOCALES, availableLangs, pageFile } from './locales.mjs';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, c) => fs.writeFileSync(path.join(ROOT, p), c);
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;');

/* ---------- carga de datos (hire-data*.js / blog-data*.js) ---------- */
function loadGlobal(file, key) {
  const sandbox = { window: {} };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(read(file), sandbox);
  return sandbox.window[key];
}

/* ---------- helpers de HTML ---------- */
function findMatchingClose(html, from) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') {
      depth -= 1;
      if (depth === 0) return m.index;
    } else depth += 1;
  }
  return -1;
}

/** Devuelve {openStart, openEnd, closeStart} de cada <div> que contiene `needle`. */
function findContainers(html, needle) {
  const found = [];
  let i = 0;
  while ((i = html.indexOf(needle, i)) !== -1) {
    const openStart = html.lastIndexOf('<div', i);
    const openEnd = html.indexOf('>', i) + 1;
    const closeStart = findMatchingClose(html, openEnd);
    if (openStart === -1 || closeStart === -1) break;
    found.push({ openStart, openEnd, closeStart });
    i = closeStart;
  }
  return found;
}

function lineIndent(html, idx) {
  const start = html.lastIndexOf('\n', idx) + 1;
  return /^[ \t]*/.exec(html.slice(start))[0];
}

/** Sustituye el contenido interior de un contenedor por `inner`. */
function setInner(html, { openEnd, closeStart }, inner) {
  return html.slice(0, openEnd) + inner + html.slice(closeStart);
}

function markerBlock(indent, marker, body) {
  return `\n${indent}<!-- ${marker}:start -->\n${body}\n${indent}<!-- ${marker}:end -->\n${indent}`;
}

/** Bloque canónico (sin saltos de línea exteriores). */
function renderBlock(indent, marker, body) {
  return `${indent}<!-- ${marker}:start -->\n${body}\n${indent}<!-- ${marker}:end -->`;
}

/** Reemplaza un bloque entre marcadores; si no existe, lo inserta antes de `anchor`. */
function setMarkedBlock(html, marker, body, anchor) {
  const startTag = `<!-- ${marker}:start -->`;
  const endTag = `<!-- ${marker}:end -->`;
  const s = html.indexOf(startTag);
  if (s !== -1) {
    const e = html.indexOf(endTag, s);
    if (e !== -1) {
      const lineStart = html.lastIndexOf('\n', s) + 1;
      const ind = lineIndent(html, s);
      const nl = html.indexOf('\n', e + endTag.length);
      const end = nl === -1 ? html.length : nl;
      return html.slice(0, lineStart) + renderBlock(ind, marker, body) + html.slice(end);
    }
  }
  if (!anchor) return html;
  const at = html.indexOf(anchor);
  if (at === -1) return html;
  const lineStart = html.lastIndexOf('\n', at) + 1;
  const ind = lineIndent(html, at);
  // Se inserta ANTES de la línea completa del ancla: nunca se recorta el texto
  // que la precede (si el ancla es un atributo, el `<div ` sigue ahí).
  return html.slice(0, lineStart) + renderBlock(ind, marker, body) + '\n' + html.slice(lineStart);
}

/* ---------- tarjetas de servicio ---------- */
function priceLabel(n) {
  return `$${n}`;
}

function serviceCard(s, indent, variant, labels) {
  const href = s.file;
  const price = `<div class="cat-card-price"><b>${priceLabel(s.price)}</b><span>${esc(labels.priceMonth)}</span></div>`;
  const cta = `<a class="btn btn--hire" href="${href}">${esc(labels.hireShort || labels.hire)} ${esc(s.category)}</a>`;

  if (variant === 'third') {
    return [
      `<article class="cap-card cap-card--third">`,
      `  <span class="cap-num">${s.num} / ${esc(s.category)}</span>`,
      `  <h3><a href="${href}">${s.cardTitle}</a></h3>`,
      `  <p>${s.cardDesc}</p>`,
      `  <div class="cat-card-foot">${price}${cta}</div>`,
      `  <span class="label">${esc(s.tags)}</span>`,
      `</article>`,
    ]
      .map((l) => indent + l)
      .join('\n');
  }

  return [
    `<article class="cap-card cat-card">`,
    `  <span class="cat-card-link"><span class="cap-num">${s.num} / ${esc(s.category)}</span></span>`,
    `  <h3 class="cat-card-title"><a href="${href}">${s.cardTitle}</a></h3>`,
    `  <p class="cat-card-desc">${s.cardDesc}</p>`,
    `  <div class="cat-card-foot">${price}${cta}</div>`,
    `  <span class="label cat-card-tags">${esc(s.tags)}</span>`,
    `</article>`,
  ]
    .map((l) => indent + l)
    .join('\n');
}

/* ---------- tarjetas de artículo ---------- */
function postCard(a, indent, hrefBase) {
  const url = path.posix.normalize(hrefBase + a.url);
  const cap = a.category.charAt(0).toUpperCase() + a.category.slice(1);
  return [
    `<a class="featured-article" href="${url}" aria-label="Read: ${esc(a.title)}">`,
    `  <div class="featured-media">`,
    `    <img src="${a.image}" alt="${esc(a.title)}" loading="lazy" decoding="async" />`,
    `    <span class="featured-pill">${esc(cap)} · ${esc(a.date)}</span>`,
    `  </div>`,
    `  <div class="featured-content">`,
    `    <h2>${a.titleHtml || esc(a.title)}</h2>`,
    `    <p>${esc(a.excerpt)}</p>`,
    `    <div class="featured-meta"><span class="author">${esc(a.author)}</span><span aria-hidden="true">·</span><span class="read-time">${esc(a.readTime)}</span></div>`,
    `  </div>`,
    `</a>`,
  ]
    .map((l) => indent + l)
    .join('\n');
}

/* ---------- rutas relativas ---------- */
function rel(fromFile, toFile) {
  const r = path.relative(path.dirname(fromFile), toFile).split(path.sep).join('/');
  return r.startsWith('.') ? r : './' + r;
}

/* href desde `file` hasta `target` (target relativo a la raíz del idioma) */
function href(file, lang, target) {
  return rel(file, path.posix.join(LOCALES[lang].dir, target));
}

/* ---------- configuración del enlazado ---------- */
const SERVICE_FILES = [
  'marketing.html',
  'campaigns.html',
  'chatbots.html',
  'ai.html',
  'ecommerce.html',
  'financial-planning.html',
];

/* categoria del post → página de servicio que soporta */
const POST_SERVICE = {
  marketing: 'marketing.html',
  ads: 'campaigns.html',
  chatbots: 'chatbots.html',
  ai: 'ai.html',
  web: 'services.html',
  negocios: 'services.html',
  tecnologia: 'services.html',
};

/* copia del bloque "temas" de 1:1 */
const SESSIONS_COPY = {
  en: {
    eyebrow: 'What we can work on',
    title: 'Pick the topic<br/>before the call.',
    lede: 'A session works best when you arrive with a concrete problem. These are the areas I work in every week — if you need the full month instead, the same work lives inside a monthly hire.',
    items: [
      ['marketing.html', 'Marketing and content', 'Channels, calendar, message'],
      ['campaigns.html', 'Paid campaigns', 'Audience, budget, tracking'],
      ['chatbots.html', 'Chatbots and WhatsApp', 'Flows, qualification, booking'],
      ['ai.html', 'AI at work', 'Tools, prompts, automation'],
      ['blog.html', 'Read first', 'Notes to arrive prepared'],
      ['clients.html', 'Who I have helped', 'Businesses and countries'],
    ],
  },
  es: {
    eyebrow: 'En qué podemos trabajar',
    title: 'Elige el tema<br/>antes de la llamada.',
    lede: 'Una sesión rinde más cuando llegas con un problema concreto. Estas son las áreas en las que trabajo cada semana — si necesitas el mes completo en vez de una hora, el mismo trabajo está dentro de un hire mensual.',
    items: [
      ['marketing.html', 'Marketing y contenido', 'Canales, calendario, mensaje'],
      ['campaigns.html', 'Campañas de pago', 'Audiencia, presupuesto, medición'],
      ['chatbots.html', 'Chatbots y WhatsApp', 'Flujos, cualificación, agenda'],
      ['ai.html', 'IA aplicada', 'Herramientas, prompts, automatización'],
      ['blog.html', 'Lee antes', 'Notas para llegar preparado'],
      ['clients.html', 'A quién he ayudado', 'Negocios y países'],
    ],
  },
};

/* copia del bloque de enlaces del blog */
const BLOG_COPY = {
  en: {
    eyebrow: 'Put it to work',
    title: 'Read about it?<br/>Now hire it.',
    lede: 'Every article maps to a service I run month after month. Pick the one that matches what you just read — or book an hour and we scope it together.',
  },
  es: {
    eyebrow: 'Ponlo a trabajar',
    title: '¿Lo has leído?<br/>Ahora contrátalo.',
    lede: 'Cada artículo corresponde a un servicio que llevo mes a mes. Elige el que encaja con lo que acabas de leer — o reserva una hora y lo aterrizamos juntos.',
  },
};

/* copia de la tarjeta lateral de los artículos */
const ARTICLE_COPY = {
  en: { title: 'Need this done?', meta: 'Monthly hire', listing: 'All articles', listingMeta: 'Blog' },
  es: { title: '¿Lo quieres hecho?', meta: 'Hire mensual', listing: 'Todos los artículos', listingMeta: 'Blog' },
};

/* ---------- builders de bloque ---------- */
function linksList(items, fromFile, indent) {
  return items
    .map(([target, title, meta]) => {
      const href = rel(fromFile, target);
      return [
        `${indent}<a class="sidebar-link" href="${href}">`,
        `${indent}  <span class="sidebar-title">${esc(title)}</span>`,
        `${indent}  <span class="sidebar-meta">${esc(meta)}</span>`,
        `${indent}</a>`,
      ].join('\n');
    })
    .join('\n');
}

function relatedRow(items, fromFile, indent) {
  return items
    .map(([target, title]) => `${indent}<a class="btn btn--ghost btn--sm" href="${rel(fromFile, target)}">${esc(title)}</a>`)
    .join('\n');
}

/* ================= procesos ================= */
const report = [];

function applyCatalogue(file, lang, D) {
  let html = read(file);
  const before = html;
  const containers = findContainers(html, 'data-hire-catalogue');
  if (!containers.length) return;

  for (let i = containers.length - 1; i >= 0; i--) {
    const c = containers[i];
    const openTag = html.slice(c.openStart, c.openEnd);
    const variant = /data-variant="([^"]+)"/.exec(openTag)?.[1] || '';
    const exclude = /data-exclude="([^"]+)"/.exec(openTag)?.[1] || '';
    const indent = lineIndent(html, c.openStart);
    const inner = indent + '  ';
    const cards = D.services
      .filter((s) => s.id !== exclude)
      .map((s) => serviceCard(s, inner, variant, D.labels))
      .join('\n');
    html = setInner(html, c, markerBlock(inner, 'il:cards', cards));
  }

  if (html !== before) {
    write(file, html);
    report.push(`${file} · ${containers.length} catálogo(s)`);
  }
}

function applyBlogGrid(file, lang, posts, hrefBase) {
  let html = read(file);
  if (html.indexOf('id="blog-grid"') === -1) return;
  const before = html;
  const containers = findContainers(html, 'id="blog-grid"');
  for (let i = containers.length - 1; i >= 0; i--) {
    const c = containers[i];
    const indent = lineIndent(html, c.openStart);
    const inner = indent + '  ';
    const cards = posts.map((a) => postCard(a, inner, hrefBase)).join('\n');
    html = setInner(html, c, markerBlock(inner, 'il:posts', cards));
  }
  if (html !== before) {
    write(file, html);
    report.push(`${file} · grid del blog (${posts.length} posts)`);
  }
}

function applyClientTags(file, lang) {
  let html = read(file);
  const before = html;

  // 1. Deshace enlaces por etiqueta (un enlace por cliente multiplicaba el mismo
  //    destino decenas de veces en la página — regla 9 · "no enlazar 10 veces").
  html = html.replace(/<a class="client-tag-link" href="[^"]*">([\s\S]*?)<\/a>/g, '$1');

  // 2. Leyenda de servicios: un enlace por servicio, antes de la tabla.
  const items = [
    ['marketing.html', SERVICE_LABELS[lang]['marketing.html']],
    ['campaigns.html', SERVICE_LABELS[lang]['campaigns.html']],
    ['chatbots.html', SERVICE_LABELS[lang]['chatbots.html']],
    ['ai.html', SERVICE_LABELS[lang]['ai.html']],
    ['ecommerce.html', SERVICE_LABELS[lang]['ecommerce.html']],
    ['financial-planning.html', SERVICE_LABELS[lang]['financial-planning.html']],
  ];
  const indent = '        ';
  const legend = [
    `${indent}<div class="client-services">`,
    `${indent}  <span class="label">${lang === 'es' ? 'Servicios que han contratado estos clientes' : 'Services these clients have hired'}</span>`,
    `${indent}  <div class="cta-row">`,
    relatedRow(items.map(([t, label]) => [path.posix.join(LOCALES[lang].dir, t), label]), file, `${indent}    `),
    `${indent}  </div>`,
    `${indent}</div>`,
  ].join('\n');

  html = setMarkedBlock(html, 'il:links', legend, 'class="clients-grid"');

  if (html !== before) {
    write(file, html);
    report.push(`${file} · leyenda de servicios (tags sin enlace)`);
  }
}

function applySessionsBlock(file, lang) {
  let html = read(file);
  const copy = SESSIONS_COPY[lang];
  if (!copy) return;
  const anchor = html.indexOf('<!-- il:links:start -->');
  const marker = html.indexOf('Google Calendar Appointment Scheduling begin');
  if (anchor === -1 && marker === -1) return;

  const indent = '    ';
  const body = [
    `${indent}  <div class="container container--narrow">`,
    `${indent}    <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(copy.eyebrow)}</span>`,
    `${indent}    <h2>${copy.title}</h2>`,
    `${indent}    <p class="lede">${esc(copy.lede)}</p>`,
    `${indent}    <div class="cta-row">`,
    relatedRow(copy.items.map(([t, title]) => [path.posix.join(LOCALES[lang].dir, t), title]), file, `${indent}      `),
    `${indent}    </div>`,
    `${indent}  </div>`,
  ].join('\n');

  const section = [
    `<section class="chapter" id="session-topics">`,
    body,
    `</section>`,
  ].join('\n');

  const before = html;
  if (anchor !== -1) {
    html = setMarkedBlock(html, 'il:links', section, null);
  } else {
    // inserta antes de la sección del calendario (la que contiene el comentario)
    const calSection = html.lastIndexOf('<section', marker);
    const ind = lineIndent(html, calSection);
    html =
      html.slice(0, calSection) +
      markerBlock(ind, 'il:links', section) +
      '\n' + ind +
      html.slice(calSection);
  }
  if (html !== before) {
    write(file, html);
    report.push(`${file} · bloque de temas 1:1`);
  }
}

function applyBlogBlock(file, lang) {
  let html = read(file);
  if (html.indexOf('id="blog-grid"') === -1) return;
  const copy = BLOG_COPY[lang];
  const sessionsFile = pageFile(lang, 'sessions.html');
  const items = [
    ['services.html', lang === 'es' ? 'Ver servicios y tarifas' : 'See services and rates'],
    [sessionsFile, lang === 'es' ? 'Reservar una hora' : 'Book an hour'],
    ['clients.html', lang === 'es' ? 'Ver clientes' : 'See clients'],
  ].map(([t, label]) => [path.posix.join(LOCALES[lang].dir, t), label]);
  const indent = '    ';
  const section = [
    `<section class="compact" id="hire-from-here">`,
    `${indent}  <div class="container container--narrow">`,
    `${indent}    <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(copy.eyebrow)}</span>`,
    `${indent}    <h2>${copy.title}</h2>`,
    `${indent}    <p class="lede">${esc(copy.lede)}</p>`,
    `${indent}    <div class="cta-row">`,
    relatedRow(items, file, `${indent}      `),
    `${indent}    </div>`,
    `${indent}  </div>`,
    `</section>`,
  ].join('\n');

  const before = html;
  html = setMarkedBlock(html, 'il:links', section, '<!-- Closing CTA -->');
  if (html !== before) {
    write(file, html);
    report.push(`${file} · bloque "contratar"`);
  }
}

/* servicio → 1:1: cierre de "no estoy listo para un hire mensual" */
const SERVICE_SESSIONS_COPY = {
  en: 'Not ready for a monthly hire?',
  es: '¿Aún no quieres un hire mensual?',
};

function applyServiceSessionsLink(file, lang) {
  let html = read(file);
  const sessions = pageFile(lang, 'sessions.html');
  const label = lang === 'es' ? 'Reserva una hora primero' : 'Book one hour first';
  const indent = '        ';
  const block = [
    `<p class="mono" style="color: var(--fg-mute);">${SERVICE_SESSIONS_COPY[lang]} <a href="${sessions}">${label}</a>.</p>`,
  ].join('\n');
  const before = html;
  html = setMarkedBlock(html, 'il:links', block, '<!-- Closing CTA -->');
  if (html !== before) {
    write(file, html);
    report.push(`${file} · enlace a 1:1 en el cierre`);
  }
}

function applyArticleSidebar(file, lang, serviceFile) {
  let html = read(file);
  if (html.indexOf('class="article-sidebar"') === -1) return;
  const copy = ARTICLE_COPY[lang];
  const blocks = html.indexOf('<!-- il:links:start -->');
  const indent = '            ';
  const card = [
    `${indent}<div class="sidebar-card">`,
    `${indent}  <h3>${esc(copy.title)}</h3>`,
    `${indent}  <a class="sidebar-link" href="${rel(file, serviceFile)}">`,
    `${indent}    <span class="sidebar-title">${esc(serviceLabel(path.posix.basename(serviceFile), lang))}</span>`,
    `${indent}    <span class="sidebar-meta">${esc(copy.meta)}</span>`,
    `${indent}  </a>`,
    `${indent}  <a class="sidebar-link" href="${rel(file, blogIndex(lang))}">`,
    `${indent}    <span class="sidebar-title">${esc(copy.listing)}</span>`,
    `${indent}    <span class="sidebar-meta">${esc(copy.listingMeta)}</span>`,
    `${indent}  </a>`,
    `${indent}</div>`,
  ].join('\n');

  const before = html;
  if (blocks === -1) {
    const at = html.indexOf('class="article-sidebar"');
    const openEnd = html.indexOf('>', at) + 1;
    html = html.slice(0, openEnd) + markerBlock(indent, 'il:links', card) + html.slice(openEnd);
  } else {
    html = setMarkedBlock(html, 'il:links', card, null);
  }
  if (html !== before) {
    write(file, html);
    report.push(`${file} · tarjeta de servicio en el sidebar`);
  }
}

/* ---------- etiquetas ---------- */
const SERVICE_LABELS = {
  en: {
    'marketing.html': 'Marketing',
    'campaigns.html': 'Paid campaigns',
    'chatbots.html': 'Chatbots',
    'ai.html': 'AI and automation',
    'ecommerce.html': 'Ecommerce',
    'financial-planning.html': 'Financial planning',
    'services.html': 'All services',
  },
  es: {
    'marketing.html': 'Marketing',
    'campaigns.html': 'Campañas de pago',
    'chatbots.html': 'Chatbots',
    'ai.html': 'IA y automatización',
    'ecommerce.html': 'Ecommerce',
    'financial-planning.html': 'Planificación financiera',
    'services.html': 'Todos los servicios',
  },
};

const BLOG_INDEX = { en: 'blog.html', es: 'blog.html' };

function serviceLabel(file, lang) {
  return SERVICE_LABELS[lang][file] || file;
}
function blogIndex(lang) {
  return path.posix.join(LOCALES[lang].dir, BLOG_INDEX[lang]);
}

/* ---------- reescribe enlaces a páginas noindex ---------- */
function fixHireLinks(file) {
  let html = read(file);
  const before = html;
  html = html.replace(/href="([a-z-]+)-hire\.html"/g, (m, id) => {
    const target = id === 'financial-planning' ? 'financial-planning.html' : `${id}.html`;
    return SERVICE_FILES.includes(target) ? `href="${target}"` : m;
  });
  if (html !== before) {
    write(file, html);
    report.push(`${file} · enlaces *-hire reescritos a su página de servicio`);
  }
}

/* ================= main ================= */
for (const lang of availableLangs()) {
  const loc = LOCALES[lang];
  const D = loadGlobal(`assets/js/hire-data${loc.dataSuffix}.js`, 'JH_HIRE');
  const posts = loadGlobal(`assets/js/blog-data${loc.dataSuffix}.js`, loc.dataSuffix ? 'BLOG_POSTS_ES' : 'BLOG_POSTS');

  const at = (name) => path.posix.join(loc.dir, name);

  // home + hub + páginas de servicio: catálogo estático
  for (const name of ['index.html', 'services.html', ...SERVICE_FILES]) applyCatalogue(at(name), lang, D);

  // páginas de servicio: puerta de entrada de bajo compromiso hacia 1:1
  for (const name of SERVICE_FILES) applyServiceSessionsLink(at(name), lang);

  // hub: enlaces *-hire → páginas reales
  fixHireLinks(at('services.html'));

  // listado del blog
  applyBlogGrid(at('blog.html'), lang, posts, '');
  applyBlogBlock(at('blog.html'), lang);

  // clientes
  applyClientTags(at('clients.html'), lang);

  // 1:1
  applySessionsBlock(at(pageFile(lang, 'sessions.html')), lang);

  // artículos: tarjeta lateral al servicio + listado
  const files = fs.globSync(path.join(ROOT, loc.dir, 'blog', '**', '*.html'));
  for (const abs of files) {
    const file = path.relative(ROOT, abs).split(path.sep).join('/');
    const slug = path.basename(file, '.html');
    const post = posts.find((p) => p.slug === slug);
    const service = (post && POST_SERVICE[post.category]) || 'services.html';
    applyArticleSidebar(file, lang, path.posix.join(loc.dir, service));
  }
}

console.log(report.length ? report.map((r) => '  ✓ ' + r).join('\n') : '  (sin cambios)');
console.log(`\ninterlink aplicado — ${report.length} archivo(s) modificados.`);
