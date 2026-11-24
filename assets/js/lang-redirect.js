/* Redirección de idioma EN/ES — 100 % en el navegador.
 *
 * Reglas (acordadas):
 *   1. ?lang=es|en guarda la preferencia y manda en esa carga.
 *   2. La preferencia guardada (cookie `lang` o sessionStorage) manda siempre,
 *      en ambos sentidos (incluido /es/ -> versión inglesa).
 *   3. Sin preferencia: decide el idioma del navegador. Si está en inglés,
 *      gana inglés aunque el país sea hispano (regla B).
 *   4. Si el navegador es neutro (francés, alemán…), decide la zona horaria
 *      convertida a país.
 *   5. Las páginas /es/ sin preferencia guardada nunca redirigen a inglés
 *      (no se rompen enlaces compartidos).
 *   6. Páginas sin versión en español (gallery, price-t, blog-t) se quedan.
 *
 * Se carga de forma síncrona en el <head> de todas las páginas para decidir
 * antes del primer pintado. Expone window.JH_LANG para depurar y probar.
 */
(function () {
  'use strict';

  var COOKIE = 'lang';
  var CHOICE_KEY = 'jh-lang-choice';

  /* Países cuya lengua principal es el español. */
  var ES_COUNTRIES = new Set([
    'ES', 'MX', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR',
    'CO', 'VE', 'EC', 'PE', 'BO', 'CL', 'AR', 'UY', 'PY', 'GQ'
  ]);

  /* Zona horaria -> país (solo zonas hispanas). */
  var TZ_COUNTRY = {
    'Europe/Madrid': 'ES',
    'Atlantic/Canary': 'ES',
    'Africa/Ceuta': 'ES',

    'America/Mexico_City': 'MX',
    'America/Cancun': 'MX',
    'America/Merida': 'MX',
    'America/Monterrey': 'MX',
    'America/Chihuahua': 'MX',
    'America/Ciudad_Juarez': 'MX',
    'America/Hermosillo': 'MX',
    'America/Mazatlan': 'MX',
    'America/Tijuana': 'MX',
    'America/Bahia_Banderas': 'MX',
    'America/Ojinaga': 'MX',

    'America/Guatemala': 'GT',
    'America/Tegucigalpa': 'HN',
    'America/El_Salvador': 'SV',
    'America/Managua': 'NI',
    'America/Costa_Rica': 'CR',
    'America/Panama': 'PA',
    'America/Havana': 'CU',
    'America/Santo_Domingo': 'DO',
    'America/Puerto_Rico': 'PR',
    'America/Bogota': 'CO',
    'America/Caracas': 'VE',
    'America/Guayaquil': 'EC',
    'Pacific/Galapagos': 'EC',
    'America/Lima': 'PE',
    'America/La_Paz': 'BO',
    'America/Santiago': 'CL',
    'Pacific/Easter': 'CL',

    'America/Argentina/Buenos_Aires': 'AR',
    'America/Argentina/Cordoba': 'AR',
    'America/Argentina/Salta': 'AR',
    'America/Argentina/Jujuy': 'AR',
    'America/Argentina/Tucuman': 'AR',
    'America/Argentina/Catamarca': 'AR',
    'America/Argentina/La_Rioja': 'AR',
    'America/Argentina/San_Juan': 'AR',
    'America/Argentina/Mendoza': 'AR',
    'America/Argentina/San_Luis': 'AR',
    'America/Argentina/Rio_Gallegos': 'AR',
    'America/Argentina/Ushuaia': 'AR',
    'America/Buenos_Aires': 'AR',
    'America/Cordoba': 'AR',
    'America/Mendoza': 'AR',
    'America/Argentina/ComodRivadavia': 'AR',

    'America/Montevideo': 'UY',
    'America/Asuncion': 'PY',
    'Africa/Malabo': 'GQ'
  };

  /* Equivalencias EN <-> ES. Si añades una página con versión en español,
     agrégala aquí. Las que no están se quedan en el idioma en que se abren. */
  var PAIRS = [
    ['/', '/es/'],
    ['/ai.html', '/es/ai.html'],
    ['/ai-hire.html', '/es/ai-hire.html'],
    ['/blog.html', '/es/blog.html'],
    ['/campaigns.html', '/es/campaigns.html'],
    ['/campaigns-hire.html', '/es/campaigns-hire.html'],
    ['/chatbots.html', '/es/chatbots.html'],
    ['/chatbots-hire.html', '/es/chatbots-hire.html'],
    ['/clients.html', '/es/clients.html'],
    ['/contract.html', '/es/contrato.html'],
    ['/ecommerce.html', '/es/ecommerce.html'],
    ['/ecommerce-hire.html', '/es/ecommerce-hire.html'],
    ['/financial-planning.html', '/es/financial-planning.html'],
    ['/financial-planning-hire.html', '/es/financial-planning-hire.html'],
    ['/marketing.html', '/es/marketing.html'],
    ['/marketing-hire.html', '/es/marketing-hire.html'],
    ['/services.html', '/es/services.html'],
    ['/sessions.html', '/es/sesiones.html'],

    ['/blog/2026/09/chat-marketing.html', '/es/blog/2026/09/chat-marketing.html'],
    ['/blog/2026/09/ia-vida-moderna.html', '/es/blog/2026/09/ia-vida-moderna.html'],
    ['/blog/2026/09/webs-2026.html', '/es/blog/2026/09/webs-2026.html'],
    ['/blog/2026/10/ia-en-el-trabajo.html', '/es/blog/2026/10/ia-en-el-trabajo.html'],
    ['/blog/2026/11/paginas-web-con-ia.html', '/es/blog/2026/11/paginas-web-con-ia.html']
  ];

  function normPath(input) {
    var p = String(input || '/');
    try { p = decodeURI(p); } catch (e) {}
    p = p.replace(/\/index\.html$/, '/');
    p = p.replace(/\/+$/, '');
    return p || '/';
  }

  var EN_TO_ES = {};
  var ES_TO_EN = {};
  PAIRS.forEach(function (pair) {
    EN_TO_ES[normPath(pair[0])] = pair[1];
    ES_TO_EN[normPath(pair[1])] = pair[0];
  });

  function isEsPath(path) {
    return path === '/es' || path.indexOf('/es/') === 0;
  }

  function readCookie(name) {
    try {
      var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function writeCookie(name, value) {
    try {
      document.cookie = name + '=' + value + ';path=/;max-age=31536000;SameSite=Lax';
    } catch (e) {}
  }

  function storageGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) {}
  }

  function savedChoice() {
    var cookie = readCookie(COOKIE);
    if (cookie === 'es' || cookie === 'en') return cookie;
    var stored = storageGet(CHOICE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
    return null;
  }

  function set(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    writeCookie(COOKIE, lang);
    storageSet(CHOICE_KEY, lang);
  }

  function browserLang(languages) {
    var list = languages;
    if (!list) {
      list = (navigator.languages && navigator.languages.length)
        ? navigator.languages
        : [navigator.language || ''];
    }
    var first = String(list[0] || '').toLowerCase();
    if (first.indexOf('es') === 0) return 'es';
    if (first.indexOf('en') === 0) return 'en';
    for (var i = 1; i < Math.min(list.length, 3); i++) {
      if (String(list[i]).toLowerCase().indexOf('es') === 0) return 'es';
    }
    return null;
  }

  function timeZoneCountry(timeZone) {
    var tz = timeZone;
    if (!tz) {
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { tz = ''; }
    }
    return TZ_COUNTRY[tz] || null;
  }

  /* `input` permite probar la decisión sin navegar:
     decide({ choice:'es', languages:['es-CO'], timeZone:'America/Bogota' }) */
  function decide(input) {
    input = input || {};
    var choice = input.choice !== undefined ? input.choice : savedChoice();
    if (choice === 'es' || choice === 'en') {
      return { lang: choice, reason: 'saved' };
    }
    var byBrowser = browserLang(input.languages);
    if (byBrowser) {
      return { lang: byBrowser, reason: 'browser' };
    }
    var country = timeZoneCountry(input.timeZone);
    if (country && ES_COUNTRIES.has(country)) {
      return { lang: 'es', reason: 'timezone:' + country };
    }
    return { lang: 'en', reason: 'default' };
  }

  function counterpart(path) {
    var p = normPath(path);
    if (EN_TO_ES[p]) return EN_TO_ES[p];
    if (ES_TO_EN[p]) return ES_TO_EN[p];
    return null;
  }

  function goTo(target) {
    if (!target) return;
    var dest = target + location.search + location.hash;
    if (dest === location.pathname + location.search + location.hash) return;
    location.replace(dest);
  }

  function main() {
    if (window.top !== window.self) return;

    /* En local (localhost) no se redirige: usa 127.0.0.1 para probar. */
    if (location.hostname === 'localhost') return;

    var params = new URLSearchParams(location.search);
    var forced = params.get('lang');
    if (forced === 'es' || forced === 'en') set(forced);
    if (params.get('noredirect') !== null) return;

    var path = normPath(location.pathname);
    if (path === '/404' || path === '/es/404') return;

    var choice = savedChoice();
    var pref = decide();
    var onEs = isEsPath(path);

    if (!onEs) {
      if (pref.lang === 'es') goTo(counterpart(path));
      return;
    }

    /* En /es/ solo se fuerza inglés si la persona eligió inglés. */
    if (choice === 'en' && pref.lang === 'en') goTo(counterpart(path));
  }

  window.JH_LANG = {
    decide: decide,
    counterpart: counterpart,
    set: set,
    normPath: normPath,
    countries: ES_COUNTRIES,
    paths: EN_TO_ES
  };

  main();
})();
