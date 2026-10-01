#!/usr/bin/env node
/*
 * Builds the contract pages from assets/js/hire-data*.js (services) — one page
 * per service × language, plus the cart-wide page:
 *
 *   EN: <service>-hire.html   (marketing-hire.html, campaigns-hire.html, …)
 *       contract.html         (cart-wide)
 *   ES: es/<service>-hire.html
 *       es/contrato.html      (cart-wide)
 *
 * The form + contract documents are rendered at runtime by
 * assets/js/contract-core.js (shared) + contract.js (single) /
 * contract-multi.js (cart) from contract-data*.js (editable text) and
 * hire-data*.js (price, duration, scope). This tool only writes the shell.
 *
 *   node tools/build-contract-pages.mjs
 */
import { pathToFileURL } from 'node:url';
import { writeFile, mkdir } from 'node:fs/promises';
import { headerHTML, drawerHTML, footerHTML, faviconHTML } from './site-shell.mjs';
import { locale, availableLangs, assetPrefix, LANG_FILES } from './locales.mjs';

const ROOT = new URL('../', import.meta.url).pathname;

async function loadHire(file) {
  delete globalThis.JH_HIRE;
  await import(pathToFileURL(ROOT + file).href);
  if (!globalThis.JH_HIRE) throw new Error('No JH_HIRE in ' + file);
  return JSON.parse(JSON.stringify(globalThis.JH_HIRE));
}

const EN = await loadHire('assets/js/hire-data.js');
const ES = await loadHire('assets/js/hire-data-es.js');

const COPY = {
  en: {
    title: (c) => c + ' contract — Jacques Hauzeur',
    desc: (c) => 'Generate the ' + c + ' service contract with Jacques Hauzeur — fill in your details, print or save as PDF.',
    eyebrow: 'Contract · 2026',
    head: 'Service contract',
    lede: 'Fill in your details below. The contract fills in live as you type — then print it or save it as a PDF.',
    multi: {
      title: 'Service contracts — Jacques Hauzeur',
      desc: 'Generate the contracts for the services in your cart — one form, one contract per service, print or save as PDF.',
      eyebrow: 'Contracts · 2026',
      head: 'Your contracts',
      lede: 'Fill in your details once. We generate one contract per service in your cart — download each one or all at once.'
    }
  },
  es: {
    title: (c) => 'Contrato de ' + c + ' — Jacques Hauzeur',
    desc: (c) => 'Genera el contrato de servicio de ' + c + ' con Jacques Hauzeur — completa tus datos, imprime o guarda como PDF.',
    eyebrow: 'Contrato · 2026',
    head: 'Contrato de servicio',
    lede: 'Completa tus datos abajo. El contrato se llena en vivo mientras escribes — luego lo imprimes o lo guardas como PDF.',
    multi: {
      title: 'Contratos de tus servicios — Jacques Hauzeur',
      desc: 'Genera los contratos de los servicios de tu carrito — un solo formulario, un contrato por servicio, imprime o guarda como PDF.',
      eyebrow: 'Contratos · 2026',
      head: 'Tus contratos',
      lede: 'Completa tus datos una sola vez. Generamos un contrato por cada servicio de tu carrito — descárgalos individualmente o todos a la vez.'
    }
  }
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function contractFile(svc) {
  return svc.file.replace(/\.html$/, '') + '-hire.html';
}
function unifiedFile(lang) {
  return LANG_FILES.contract[lang];
}

function layout(lang, copy, name, title, desc, body, scripts) {
  const A = assetPrefix(lang);
  const L = locale(lang);
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

${headerHTML(lang, '', name)}

${drawerHTML(lang, name)}

  <main id="main">
    <section class="contract-page">
      <div class="container container--wide">
${body}
      </div>
    </section>
  </main>

${footerHTML(lang)}

${scripts}
</body>
</html>
`;
}

function scripts(lang, app) {
  const A = assetPrefix(lang);
  const suffix = locale(lang).dataSuffix;
  return [
    '  <script src="' + A + '/js/hire-data' + suffix + '.js" defer></script>',
    '  <script src="' + A + '/js/contract-data' + suffix + '.js" defer></script>',
    '  <script src="' + A + '/js/contract-core.js" defer></script>',
    '  <script src="' + A + '/js/' + app + '" defer></script>',
    '  <script src="' + A + '/js/site.js" defer></script>'
  ].join('\n');
}

function servicePage(lang, copy, svc) {
  const name = contractFile(svc);
  const body =
    '        <div class="contract-head">\n' +
    '          <span class="eyebrow"><span class="dot" aria-hidden="true"></span>' + copy.eyebrow + '</span>\n' +
    '          <h1><span class="lime">' + esc(copy.head) + '</span><br/>' + esc(svc.category) + '</h1>\n' +
    '          <p class="lede">' + copy.lede + '</p>\n' +
    '        </div>\n' +
    '        <div id="contract-app" data-service="' + svc.id + '"><!-- rendered by contract.js --></div>';
  return layout(lang, copy, name, copy.title(svc.category), copy.desc(svc.category), body, scripts(lang, 'contract.js'));
}

function unifiedPage(lang, copy) {
  const name = unifiedFile(lang);
  const M = copy.multi;
  const body =
    '        <div class="contract-head">\n' +
    '          <span class="eyebrow"><span class="dot" aria-hidden="true"></span>' + M.eyebrow + '</span>\n' +
    '          <h1><span class="lime">' + esc(M.head) + '</span></h1>\n' +
    '          <p class="lede">' + M.lede + '</p>\n' +
    '        </div>\n' +
    '        <div id="contract-app" data-multi="true"><!-- rendered by contract-multi.js --></div>';
  return layout(lang, copy, name, M.title, M.desc, body, scripts(lang, 'contract-multi.js'));
}

const DATA = { en: EN, es: ES };

async function main() {
  for (const lang of availableLangs()) {
    const copy = COPY[lang];
    const data = DATA[lang];
    const dir = ROOT + locale(lang).dir;
    await mkdir(dir, { recursive: true });
    for (const svc of data.services) {
      const file = dir + contractFile(svc);
      await writeFile(file, servicePage(lang, copy, svc));
      console.log('wrote ' + file.replace(ROOT, ''));
    }
    const unified = dir + unifiedFile(lang);
    await writeFile(unified, unifiedPage(lang, copy));
    console.log('wrote ' + unified.replace(ROOT, ''));
  }
  console.log('Done — contract pages generated from hire-data*.js');
}

await main();
