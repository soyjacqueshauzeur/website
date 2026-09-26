/* FX layer — USD-priced site with optional secondary-currency equivalents.
   Reads live rates from Frankfurter (no API key, CORS-open), caches them in
   localStorage for 24h, exposes formatting helpers and a currency picker, and
   keeps a structured payment quote (jh-pay-quote) ready for payment gateways.

   Load BEFORE hire.js / class-booking.js. All strings are shared EN/ES; the
   currency list uses native labels so the picker reads the same in both. */
(function () {
  'use strict';

  var API = 'https://api.frankfurter.dev/v2/rates';
  var BASE = 'USD';
  var CACHE_KEY = 'jh-fx';
  var SEL_KEY = 'jh-fx-sel';
  var QUOTE_KEY = 'jh-pay-quote';
  var TTL = 24 * 60 * 60 * 1000; // 24h

  var DEFAULT_SEL = 'COP';

  /* Native labels + flag country code (flagcdn). Sorted by name below. */
  var FLAG_CDN = 'https://flagcdn.com/w40';
  var CURRENCIES = [
    { code: 'ARS', name: 'Peso argentino', country: 'Argentina', flag: 'ar' },
    { code: 'BOB', name: 'Boliviano', country: 'Bolivia', flag: 'bo' },
    { code: 'BRL', name: 'Real brasileño', country: 'Brasil', flag: 'br' },
    { code: 'CLP', name: 'Peso chileno', country: 'Chile', flag: 'cl' },
    { code: 'COP', name: 'Peso colombiano', country: 'Colombia', flag: 'co' },
    { code: 'CRC', name: 'Colón costarricense', country: 'Costa Rica', flag: 'cr' },
    { code: 'DOP', name: 'Peso dominicano', country: 'República Dominicana', flag: 'do' },
    { code: 'EUR', name: 'Euro', country: 'Eurozona', flag: 'eu' },
    { code: 'GTQ', name: 'Quetzal', country: 'Guatemala', flag: 'gt' },
    { code: 'HNL', name: 'Lempira', country: 'Honduras', flag: 'hn' },
    { code: 'MXN', name: 'Peso mexicano', country: 'México', flag: 'mx' },
    { code: 'NIO', name: 'Córdoba', country: 'Nicaragua', flag: 'ni' },
    { code: 'PAB', name: 'Balboa', country: 'Panamá', flag: 'pa' },
    { code: 'PEN', name: 'Sol', country: 'Perú', flag: 'pe' },
    { code: 'PYG', name: 'Guaraní', country: 'Paraguay', flag: 'py' },
    { code: 'RUB', name: 'Rublo ruso', country: 'Rusia', flag: 'ru' },
    { code: 'UYU', name: 'Peso uruguayo', country: 'Uruguay', flag: 'uy' },
    { code: 'VES', name: 'Bolívar', country: 'Venezuela', flag: 've' }
  ].sort(function (a, b) { return a.country.localeCompare(b.country, 'es'); });

  var state = {
    sel: loadSel(),
    rates: null,        // {COP: 3125.52, …} relative to USD
    callbacks: []
  };

  /* ---------------- persistence helpers ---------------- */
  function readLS(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function writeLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function loadSel() {
    try {
      var v = localStorage.getItem(SEL_KEY);
      return (v && currencyByCode(v)) ? v : DEFAULT_SEL;
    } catch (e) { return DEFAULT_SEL; }
  }
  function saveSel(code) {
    try { localStorage.setItem(SEL_KEY, code); } catch (e) {}
  }
  function currencyByCode(code) {
    for (var i = 0; i < CURRENCIES.length; i++) if (CURRENCIES[i].code === code) return CURRENCIES[i];
    return null;
  }

  /* ---------------- rates: fetch + 24h cache ---------------- */
  function cacheFresh() {
    var c = readLS(CACHE_KEY);
    return !!(c && c.rates && c.ts && (Date.now() - c.ts) < TTL);
  }
  function loadRates() {
    var c = readLS(CACHE_KEY);
    if (c && c.rates) {
      state.rates = c.rates;
      if (cacheFresh()) { notify(); return; }
    }
    var quotes = CURRENCIES.map(function (x) { return x.code; }).join(',');
    fetch(API + '?base=' + BASE + '&quotes=' + quotes)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('fx http ' + r.status)); })
      .then(function (rows) {
        var rates = {};
        (rows || []).forEach(function (row) { if (row && row.quote) rates[row.quote] = row.rate; });
        rates[BASE] = 1;
        state.rates = rates;
        writeLS(CACHE_KEY, { ts: Date.now(), rates: rates });
        notify();
      })
      .catch(function () { /* keep cache if any; else USD only */ notify(); });
  }
  function notify() {
    for (var i = 0; i < state.callbacks.length; i++) { try { state.callbacks[i](); } catch (e) {} }
    state.callbacks = [];
    renderApproxNodes();
  }
  function ready(cb) {
    if (state.rates) { cb(); return; }
    state.callbacks.push(cb);
  }

  function getRate(code) {
    if (!state.rates) return null;
    var r = state.rates[code];
    return (typeof r === 'number' && isFinite(r)) ? r : null;
  }

  /* ---------------- formatting ---------------- */
  function fmtUSD(n) { return '$' + Number(n).toLocaleString('en-US'); }

  var nfCache = {};
  function nf(code) {
    if (!nfCache[code]) {
      try { nfCache[code] = new Intl.NumberFormat(undefined, { style: 'currency', currency: code }); }
      catch (e) {
        try { nfCache[code] = new Intl.NumberFormat('en', { style: 'currency', currency: code }); }
        catch (e2) { nfCache[code] = null; }
      }
    }
    return nfCache[code];
  }
  function fmtLocal(usdAmount, code) {
    var c = code || state.sel;
    var rate = getRate(c);
    if (!rate) return null;
    var f = nf(c);
    var val = Number(usdAmount) * rate;
    var out = f ? f.format(val) : val.toFixed(2) + ' ' + c;
    return out;
  }
  /* Compact label used in the ≈ line: 'Peso colombiano (COP)' */
  function curLabel(code) {
    var c = currencyByCode(code);
    return c ? c.name + ' (' + code + ')' : code;
  }

  /* ---------------- picker UI (custom dropdown: flag + country) ------------- */
  function isEsPage() {
    return (document.documentElement.getAttribute('lang') || 'en').toLowerCase().indexOf('es') === 0;
  }
  function flagImg(c, size) {
    var w = size || 20;
    return '<img class="fx-flag" src="' + FLAG_CDN + '/' + c.flag + '.png" alt="" width="' + w + '" height="' + w + '" loading="lazy" />';
  }
  function currentCountry(code) {
    var c = currencyByCode(code);
    return c ? c.country : code;
  }
  function menuHTML() {
    var opts = '';
    for (var i = 0; i < CURRENCIES.length; i++) {
      var c = CURRENCIES[i];
      opts +=
        '<li role="option" id="fx-opt-' + c.code + '" data-fx-code="' + c.code + '"' +
        (c.code === state.sel ? ' aria-selected="true" tabindex="0"' : ' aria-selected="false" tabindex="-1"') + '>' +
        flagImg(c) + '<span>' + c.country + '</span></li>';
    }
    return opts;
  }
  function createPicker(host) {
    var es = isEsPage();
    var current = currencyByCode(state.sel);
    var wrap = document.createElement('div');
    wrap.className = 'fx-pick';
    wrap.innerHTML =
      '<span class="fx-pick-label">' + (es ? 'Moneda local (referencia)' : 'Local currency (reference)') + '</span>' +
      '<div class="fx-dropdown">' +
        '<button type="button" class="fx-dropdown-btn" aria-haspopup="listbox" aria-expanded="false">' +
          flagImg(current, 22) + '<span class="fx-dd-current">' + current.country + '</span>' +
          '<span class="fx-dd-chevron" aria-hidden="true">\u25be</span>' +
        '</button>' +
        '<ul class="fx-listbox" role="listbox" aria-label="' +
          (es ? 'Moneda secundaria' : 'Secondary currency') + '" hidden>' + menuHTML() + '</ul>' +
      '</div>';
    host.appendChild(wrap);

    var dd = wrap.querySelector('.fx-dropdown');
    var btn = wrap.querySelector('.fx-dropdown-btn');
    var list = wrap.querySelector('.fx-listbox');
    var opts = list.querySelectorAll('[data-fx-code]');

    function openMenu() {
      closeAllMenus();
      list.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var selEl = list.querySelector('[aria-selected="true"]');
      if (selEl) selEl.scrollIntoView({ block: 'nearest' });
    }
    function closeMenu() {
      list.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
    function focusOpt(idx) {
      var el = opts[idx];
      if (!el) return;
      el.focus();
    }
    function selectedIndex() {
      for (var i = 0; i < opts.length; i++) {
        if (opts[i].getAttribute('data-fx-code') === state.sel) return i;
      }
      return 0;
    }
    function choose(el) {
      setSel(el.getAttribute('data-fx-code'));
      closeMenu();
      btn.focus();
    }

    btn.addEventListener('click', function () {
      if (list.hidden) openMenu(); else closeMenu();
    });
    opts.forEach(function (el) {
      el.addEventListener('click', function () { choose(el); });
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
        var idx = selectedIndex();
        focusOpt(e.key === 'ArrowDown' ? Math.min(opts.length - 1, idx + 1) : idx);
      }
    });
    list.addEventListener('keydown', function (e) {
      var active = document.activeElement && document.activeElement.getAttribute('data-fx-code');
      var idx = 0;
      for (var i = 0; i < opts.length; i++) {
        if (opts[i].getAttribute('data-fx-code') === (active || state.sel)) { idx = i; break; }
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); focusOpt(Math.min(opts.length - 1, idx + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusOpt(Math.max(0, idx - 1)); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(opts[idx]); }
      else if (e.key === 'Home') { e.preventDefault(); focusOpt(0); }
      else if (e.key === 'End') { e.preventDefault(); focusOpt(opts.length - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); closeMenu(); btn.focus(); }
    });
  }

  function closeAllMenus() {
    var dds = document.querySelectorAll('.fx-dropdown');
    for (var i = 0; i < dds.length; i++) {
      var list = dds[i].querySelector('.fx-listbox');
      var btn = dds[i].querySelector('.fx-dropdown-btn');
      if (list) list.hidden = true;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }

  function ensurePicker() {
    var anchors = document.querySelectorAll('[data-fx-anchor]');
    for (var a = 0; a < anchors.length; a++) {
      var host = anchors[a];
      if (host.querySelector('.fx-dropdown')) continue;
      createPicker(host);
    }
  }

  document.addEventListener('click', function (e) {
    var dds = document.querySelectorAll('.fx-dropdown');
    for (var i = 0; i < dds.length; i++) {
      if (dds[i].contains(e.target)) continue;
      var list = dds[i].querySelector('.fx-listbox');
      var btn = dds[i].querySelector('.fx-dropdown-btn');
      if (list) list.hidden = true;
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  function setSel(code) {
    if (!currencyByCode(code)) code = DEFAULT_SEL;
    state.sel = code;
    saveSel(code);
    var dds = document.querySelectorAll('.fx-dropdown');
    for (var i = 0; i < dds.length; i++) {
      var btnTxt = dds[i].querySelector('.fx-dd-current');
      var cur = currencyByCode(code);
      var flagWrap = dds[i].querySelector('.fx-dropdown-btn .fx-flag');
      if (btnTxt && cur) btnTxt.textContent = cur.country;
      if (flagWrap && cur) flagWrap.setAttribute('src', FLAG_CDN + '/' + cur.flag + '.png');
      var opts = dds[i].querySelectorAll('[data-fx-code]');
      for (var j = 0; j < opts.length; j++) {
        opts[j].setAttribute('aria-selected', String(opts[j].getAttribute('data-fx-code') === code));
        opts[j].removeAttribute('tabindex');
      }
      var selOpt = dds[i].querySelector('[data-fx-code="' + code + '"]');
      if (selOpt) selOpt.setAttribute('tabindex', '0');
    }
    document.dispatchEvent(new CustomEvent('jh:fxchange', { detail: { currency: code } }));
  }

  /* ---------------- price markup helpers ---------------- */
  /* Returns a placeholder span for a USD amount; fx fills it with ≈ local. */
  function approxNode(usdAmount) {
    return '<span class="price-approx" data-approx="' + usdAmount + '"></span>';
  }
  /* Live nodes: [data-approx]. Re-renders on rate load and currency change. */
  function renderApproxNodes() {
    if (!state.rates) return;
    var nodes = document.querySelectorAll('[data-approx]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var local = fmtLocal(Number(el.getAttribute('data-approx')), state.sel);
      if (local) el.innerHTML = '<span class="pa-tilde">\u2248</span> <span class="pa-val">' + local + '</span>';
    }
  }

  document.addEventListener('jh:fxchange', renderApproxNodes);
  document.addEventListener('DOMContentLoaded', function () {
    ensurePicker();
    renderApproxNodes();
  });

  /* ---------------- payment quote persistence ---------------- */
  /* Writes a structured quote for later gateway use:
     { ts, currency, items:[{id,name,qty,usdTotal,localTotal,rate}], totals:{usd,local} } */
  function saveQuote(items, opts) {
    opts = opts || {};
    var rate = getRate(state.sel);
    var usd = 0;
    var rows = (items || []).map(function (it) {
      var t = Number(it.usdTotal);
      usd += t;
      return {
        id: it.id || null,
        name: it.name || '',
        qty: it.qty != null ? it.qty : 1,
        usdTotal: t,
        localTotal: rate ? Number((t * rate).toFixed(2)) : null,
        rate: rate
      };
    });
    writeLS(QUOTE_KEY, {
      ts: Date.now(),
      currency: state.sel,
      base: BASE,
      items: rows,
      totals: {
        usd: usd,
        local: rate ? Number((usd * rate).toFixed(2)) : null
      }
    });
  }
  function clearQuote() {
    try { localStorage.removeItem(QUOTE_KEY); } catch (e) {}
  }

  /* ---------------- public API ---------------- */
  window.JH_FX = {
    CURRENCIES: CURRENCIES,
    BASE: BASE,
    defaultSel: DEFAULT_SEL,
    get sel() { return state.sel; },
    isReady: function () { return !!state.rates; },
    ready: ready,
    loadRates: loadRates,
    getRate: getRate,
    fmtUSD: fmtUSD,
    fmtLocal: fmtLocal,
    curLabel: curLabel,
    approxNode: approxNode,
    renderApproxNodes: renderApproxNodes,
    setSel: setSel,
    saveQuote: saveQuote,
    clearQuote: clearQuote,
    picker: ensurePicker
  };

  loadRates();
})();
