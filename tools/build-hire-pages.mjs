#!/usr/bin/env node
/*
 * Builds the monthly-hire pages from assets/js/hire-data.js + hire-data-es.js
 * (the same files that drive the cart at runtime — single source of truth).
 *
 *   node tools/build-hire-pages.mjs
 *
 * Output (always overwritten):
 *   EN: services.html, marketing.html, campaigns.html, chatbots.html,
 *       ai.html, financial-planning.html, ecommerce.html
 *   ES: es/<same filenames>
 * index.html is NOT touched.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { writeFile, mkdir } from 'node:fs/promises';
import { headerHTML, drawerHTML, footerHTML, faviconHTML } from './site-shell.mjs';
import { locale, availableLangs, assetPrefix, LANG_FILES } from './locales.mjs';

const ROOT = new URL('../', import.meta.url).pathname;

async function loadData(file) {
  delete globalThis.JH_HIRE;
  await import(pathToFileURL(ROOT + file).href);
  if (!globalThis.JH_HIRE) throw new Error('No JH_HIRE in ' + file);
  return JSON.parse(JSON.stringify(globalThis.JH_HIRE));
}

const EN = await loadData('assets/js/hire-data.js');
const ES = await loadData('assets/js/hire-data-es.js');

const WA = 'https://wa.me/573507402009';

/* ---- per-language copy that does not live in the runtime data ---- */
const COPY = {
  en: {
    hub: {
      title: 'Hire Jacques Hauzeur — monthly services & rates',
      desc: 'Hire Jacques Hauzeur by the month — marketing, paid campaigns, chatbots, AI, financial planning and e-commerce. One service or several, 1–12 months.',
      eyebrow: 'Monthly hire · no lock-in',
      h1: 'Hire me by the<br/><span class="lime">month</span>.<br/>No lock-in <span class="slash">//</span>',
      sub: 'Pick one service or bundle several. Each hire runs monthly for the duration you choose — 1, 3, 6 or 12 months. Send the order, I confirm the same day and get you set up. Pause or cancel anytime.',
      ctaPrimary: 'See the services',
      ctaSecondary: 'Ask me first',
      sideTitle: 'How the hire works',
      sideSteps: [
        ['Choose', 'Each service shows its monthly price. Pick one — or several.'],
        ['Pick the duration', '1, 3, 6 or 12 months, adjusted in your cart.'],
        ['Send & pay', 'I confirm your order and send a payment link — Mercado Pago, PayPal, local bank or whatever works for you.']
      ],
      catEyebrow: 'The catalogue',
      catTitle: 'All six.<br/>One <span class="lime">monthly</span> hire.',
      catLede: 'Choose as many as you need — each runs monthly and you adjust the duration in your cart before you send the order.',
      closeEyebrow: 'Start · 2026',
      closeTitle: 'Start a<br/><span class="lime">monthly</span> hire.',
      closeSub: 'Still deciding? Tell me where you are stuck — a website, a campaign, a chatbot that should be booking, or numbers you cannot see clearly — and I will tell you honestly if it is a one-hour fix or a monthly hire.',
      closePrimary: 'Review your hire',
      closeSecondary: 'Ask me a question first',
      contractHubLabel: 'Download the service contract',
      contractUnifiedLabel: 'Contracts for your cart',
      payLabel: 'Payment',
      payNote: 'Mercado Pago, PayPal, local bank or another method — the link arrives when I confirm the order.'
    },
    service: {
      metaTitle: (svc) => `${svc.category} — monthly hire from $${svc.price}/mo`,
      hireLabel: 'monthly hire',
      seeAll: 'See all services',
      secYouGet: 'What you get each month',
      secMoreEyebrow: 'Bundle · hire another',
      closerEyebrow: 'Hire · 2026',
      closeTitle: 'Run it as a<br/><span class="lime">system</span>, not a<br/>one-off.',
      closeSub: 'Add this service to a monthly hire — or bundle it with others above and run them as one system. I confirm the same day and send the payment link.',
      heroPill: 'Hire this service',
      contractBullet: 'Download our work contract here',
      contractBtn: 'Open contract'
    }
  },
  es: {
    hub: {
      title: 'Contrata a Jacques Hauzeur — servicios y tarifas mensuales',
      desc: 'Contrata a Jacques Hauzeur por mes — marketing, campañas, chatbots, IA, finanzas y e-commerce. Un servicio o varios, de 1 a 12 meses.',
      eyebrow: 'Hire mensual · sin permanencia',
      h1: 'Contrátame por<br/><span class="lime">mes</span>.<br/>Sin permanencia <span class="slash">//</span>',
      sub: 'Elige un servicio o combina varios. Cada hire es mensual por la duración que elijas — 1, 3, 6 o 12 meses. Envía el pedido, confirmo el mismo día y te dejo todo funcionando. Pausa o cancela cuando quieras.',
      ctaPrimary: 'Ver los servicios',
      ctaSecondary: 'Pregúntame primero',
      sideTitle: 'Cómo funciona',
      sideSteps: [
        ['Elige', 'Cada servicio muestra su precio mensual. Elige uno — o varios.'],
        ['Elige la duración', '1, 3, 6 o 12 meses, ajustable en tu carrito.'],
        ['Envía y paga', 'Confirmo tu pedido y te envío el link de pago — Mercado Pago, PayPal, banco local o lo que te funcione.']
      ],
      catEyebrow: 'El catálogo',
      catTitle: 'Los seis.<br/>Un solo <span class="lime">hire</span> mensual.',
      catLede: 'Elige los que necesites — cada uno corre por mes y ajustas la duración en tu carrito antes de enviar el pedido.',
      closeEyebrow: 'Empieza · 2026',
      closeTitle: 'Empieza un<br/><span class="lime">hire</span> mensual.',
      closeSub: '¿Aún decides? Cuéntame dónde estás atascado — una web, una campaña, un chatbot que debería agendar, o números que no ves con claridad — y te digo con honestidad si es un arreglo de una hora o un hire mensual.',
      closePrimary: 'Revisar tu contratación',
      closeSecondary: 'Hazme una pregunta primero',
      contractHubLabel: 'Descarga el contrato del servicio',
      contractUnifiedLabel: 'Contratos de tu carrito',
      payLabel: 'Pago',
      payNote: 'Mercado Pago, PayPal, banco local u otro medio — te envío el link al confirmar el pedido.'
    },
    service: {
      metaTitle: (svc) => `${svc.category} — hire mensual desde $${svc.price}/mes`,
      hireLabel: 'hire mensual',
      seeAll: 'Ver todos los servicios',
      secYouGet: 'Qué recibes cada mes',
      secMoreEyebrow: 'Combina · contrata otro',
      closerEyebrow: 'Hire · 2026',
      closeTitle: 'Llévalo como<br/><span class="lime">sistema</span>, no<br/>como un gasto suelto.',
      closeSub: 'Añade este servicio a un hire mensual — o combínalo con otros arriba y llévalos como un solo sistema. Confirmo el mismo día y te envío el link de pago.',
      heroPill: 'Contratar este servicio',
      contractBullet: 'Descarga aquí nuestro contrato de trabajo',
      contractBtn: 'Abrir contrato'
    }
  }
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shell(lang, copy, data, title, desc, active, pageBasename, body) {
  const A = assetPrefix(lang);
  const L = locale(lang);
  const page = pageBasename || 'services.html';
  return `<!doctype html>
<html lang="${L.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
${faviconHTML(A)}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Boldonse&family=Inter+Tight:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" />
  <link rel="stylesheet" href="${A}/css/styles.css" />
</head>
<body>
  <a class="skip-link" href="#main">${L.skip}</a>

${headerHTML(lang, active, page)}

${drawerHTML(lang, page)}

  <main id="main">
${body}
  </main>

${footerHTML(lang)}

  <script src="${A}/js/fx.js" defer></script>
  <script src="${A}/js/hire-data${L.dataSuffix}.js" defer></script>
  <script src="${A}/js/hire.js" defer></script>
  <script src="${A}/js/site.js" defer></script>
${L.terms ? '  <script src="' + A + '/js/terms.js" defer></script>\n' : ''}</body>
</html>
`;
}

function payChips(data) {
  return data.payments.map((p) => `<span class="pay-chip">${p.label}</span>`).join('');
}

function hubBody(lang, copy, data) {
  const L = copy.hub;
  const side = L.sideSteps
    .map(([t, d], i) => `<li><b>0${i + 1} · ${t}</b><span>${d}</span></li>`)
    .join('\n            ');
  return `
    <!-- Hub hero -->
    <section class="hero">
      <div class="container container--wide">
        <div class="hero-grid">
          <div class="hero-text">
            <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${L.eyebrow}</span>
            <h1 class="hero-headline">${L.h1}</h1>
            <p class="hero-sub">${L.sub}</p>
            <div class="hero-cta-row">
              <a class="btn btn--primary btn--lg" href="#hire-catalogue">${L.ctaPrimary}
                <svg class="arrow" width="16" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
              <a class="btn btn--ghost btn--lg" href="${WA}" target="_blank" rel="noopener">${L.ctaSecondary}</a>
            </div>
          </div>
          <div class="hire-hero-side">
            <div class="hire-side-card">
              <span class="label">${L.sideTitle}</span>
              <ul class="hire-steps">
${side}
              </ul>
              <span class="label hire-pay-label">${L.payLabel} · ${payChips(data)}</span>
              <p class="mono hire-pay-note">${L.payNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Catalogue -->
    <section id="hire-catalogue">
      <div class="container container--wide">
        <div class="section-head">
          <div>
            <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${L.catEyebrow}</span>
            <h2>${L.catTitle}</h2>
          </div>
          <p class="lede">${L.catLede}</p>
        </div>
        <div class="fx-anchor-row" data-fx-anchor></div>
        <div class="cap-bento hire-cat" data-hire-catalogue><!-- rendered by hire.js --></div>
        <div class="contract-hub">
          <span class="label">${L.contractHubLabel}</span>
          <div class="contract-hub-links"><a class="btn btn--primary btn--sm" href="${LANG_FILES.contract[lang]}">${L.contractUnifiedLabel}</a>${data.services.map((s) => `<a class="btn btn--ghost btn--sm" href="${s.file.replace(/\.html$/, '')}-hire.html">${s.category}</a>`).join('')}</div>
        </div>
        <div class="center-row" style="margin-top: var(--space-7); justify-content: center;">
          <button type="button" class="btn btn--dark btn--lg js-hire-open" data-hire-open>${data.labels.openCart}
            <svg class="arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="closing-cta">
      <div class="container container--narrow">
        <span class="label" style="color: rgba(10,10,12,0.6);">${L.closeEyebrow}</span>
        <h2>${L.closeTitle}</h2>
        <p class="lede">${L.closeSub}</p>
        <div class="cta-row">
          <button type="button" class="btn btn--dark btn--lg js-hire-open" data-hire-open>${L.closePrimary}
            <svg class="arrow" width="16" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <a class="btn btn--ghost btn--lg" href="${WA}" target="_blank" rel="noopener">${L.closeSecondary}</a>
        </div>
      </div>
    </section>`;
}

function serviceBody(lang, copy, data, svc) {
  const S = copy.service;
  const bullets = svc.includes.map((b) => `          <li>${b}</li>`).join('\n');
  const contractFile = svc.file.replace(/\.html$/, '') + '-hire.html';
  const contractLi = `          <li class="hire-contract"><a class="hire-contract-link" href="${contractFile}">${S.contractBullet}</a><a class="btn btn--hire btn--sm" href="${contractFile}">${S.contractBtn}</a></li>`;
  return `
    <!-- Service hero + price panel -->
    <section class="hero">
      <div class="container container--wide">
        <div class="hero-grid">
          <div class="hero-text">
            <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${svc.num} / ${svc.category} · ${S.hireLabel}</span>
            <h1 class="hero-headline">${svc.pageTitle}</h1>
            <p class="hero-sub">${svc.pageSub}</p>
            <p class="mono" style="margin-top: var(--space-2); color: var(--fg-mute);">${svc.pageMeta}</p>
            <div class="hero-cta-row">
              <button type="button" class="btn btn--primary btn--lg" data-hire-add-open="${svc.id}">${S.heroPill}
                <svg class="arrow" width="16" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <a class="btn btn--ghost btn--lg" href="#hire-scope">${data.labels.youGet}</a>
            </div>
          </div>
          <div class="hire-hero-side">
            <div class="hire-side-card" id="hire-panel" data-hire-panel="${svc.id}"><!-- rendered by hire.js; includes the FX currency picker above the description --></div>
          </div>
        </div>
      </div>
    </section>

    <!-- What you get -->
    <section class="snug" id="hire-scope">
      <div class="container container--wide">
        <div class="hire-scope-grid">
          <div>
            <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${svc.num} / ${svc.category}</span>
            <h2>${S.secYouGet}<br/><span class="lime">, every</span> month.</h2>
            <p class="lede">${svc.cardDesc}</p>
          </div>
          <ul class="hire-includes">
${bullets}
${contractLi}
          </ul>
        </div>
      </div>
    </section>

    <!-- Bundle -->
    <section id="hire-more">
      <div class="container container--wide">
        <div class="section-head">
          <div>
            <span class="eyebrow"><span class="dot" aria-hidden="true"></span>${S.secMoreEyebrow}</span>
            <h2>${data.labels.otherServices}</h2>
          </div>
          <p class="lede">${data.labels.otherLede}</p>
        </div>
        <div class="cap-bento hire-cat" data-hire-catalogue data-exclude="${svc.id}"><!-- rendered by hire.js --></div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="closing-cta">
      <div class="container container--narrow">
        <span class="label" style="color: rgba(10,10,12,0.6);">${S.closerEyebrow}</span>
        <h2>${S.closeTitle}</h2>
        <p class="lede">${S.closeSub}</p>
        <div class="cta-row">
          <button type="button" class="btn btn--dark btn--lg js-hire-open" data-hire-open>${data.labels.openCart}
            <svg class="arrow" width="16" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <a class="btn btn--ghost btn--lg" href="services.html">${S.seeAll}</a>
        </div>
      </div>
    </section>`;
}

function servicePage(lang, copy, data, svc) {
  const title = copy.service.metaTitle(svc);
  const desc = svc.pageSub.slice(0, 160);
  return shell(lang, copy, data, title, desc, 'services.html', svc.file, serviceBody(lang, copy, data, svc));
}

function hubPage(lang, copy, data) {
  const desc = COPY[lang].hub.desc;
  return shell(lang, copy, data, COPY[lang].hub.title, desc, 'services.html', 'services.html', hubBody(lang, copy, data));
}

const DATA = { en: EN, es: ES };

async function main() {
  for (const lang of availableLangs()) {
    const copy = COPY[lang];
    const data = DATA[lang];
    const dir = ROOT + locale(lang).dir;
    await mkdir(dir, { recursive: true });
    const pages = [hubPage(lang, copy, data)];
    for (const svc of data.services) {
      pages.push(servicePage(lang, copy, data, svc));
    }
    const names = ['services.html', ...data.services.map((s) => s.file)];
    for (let i = 0; i < names.length; i++) {
      const file = dir + names[i];
      await writeFile(file, pages[i]);
      console.log('wrote ' + file.replace(ROOT, ''));
    }
  }
  console.log('Done — hire pages generated from hire-data*.js');
}

await main();
