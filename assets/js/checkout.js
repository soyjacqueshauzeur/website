/* Shared MercadoPago client (Checkout Pro — pago único del total).
   Llama al backend serverless (que guarda el secreto) y redirige al checkout.

     JH_CHECKOUT.pay({ area, items:[{id,qty}], payer?, back?, backFail?, button? })

   El backend resuelve los precios desde su catálogo; el navegador solo manda
   ids + cantidades. Incluye anti doble-clic e Idempotency-Key por carrito. */

(function () {
  'use strict';

  /* URL del backend serverless (Cloudflare Worker). Cambia esto por tu URL
     o define window.JH_CHECKOUT_BACKEND antes de cargar este archivo. */
  var BACKEND = window.JH_CHECKOUT_BACKEND || 'https://tienda-mercadopago.REEMPLAZA.workers.dev';

  var inFlight = false;

  /* Reutiliza una Idempotency-Key por "carrito" (evita duplicados si el usuario
     reintenta o hace doble clic). Se guarda en sessionStorage. */
  function idemKey(payload) {
    var sig = (payload.area || '') + '|' + JSON.stringify(payload.items || []) + '|' + ((payload.payer && payload.payer.email) || '');
    var store = {};
    try { store = JSON.parse(sessionStorage.getItem('jh-ck-keys') || '{}') || {}; } catch (e) { store = {}; }
    if (!store[sig]) {
      store[sig] = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      var keys = Object.keys(store);
      for (var i = 0; i < keys.length - 20; i++) delete store[keys[i]];
      try { sessionStorage.setItem('jh-ck-keys', JSON.stringify(store)); } catch (e) {}
    }
    return store[sig];
  }

  function go(path, opts, button) {
    opts = opts || {};
    if (!opts.area || !Array.isArray(opts.items) || !opts.items.length) {
      return Promise.reject(new Error('Falta area o items'));
    }
    if (inFlight) return Promise.reject(new Error('Ya hay un pago en curso.'));
    inFlight = true;
    if (button) button.disabled = true;

    var key = idemKey(opts);
    var restore = function () { inFlight = false; if (button) button.disabled = false; };

    return fetch(BACKEND + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': key },
      body: JSON.stringify({
        area: opts.area,
        items: opts.items,
        payer: opts.payer || {},
        back: opts.back,
        backFail: opts.backFail,
        idempotencyKey: key
      })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (r) {
        if (r && r.ok && r.init_point) {
          window.location.href = r.init_point;
          return r;
        }
        restore();
        throw new Error((r && r.error) || 'No se pudo iniciar el pago');
      })
      .catch(function (err) {
        restore();
        throw err;
      });
  }

  /* Carga perezosa del helper (para páginas que no lo incluyen). */
  function load(cb) {
    if (window.JH_CHECKOUT) { cb(window.JH_CHECKOUT); return; }
    var s = document.createElement('script');
    s.src = '/assets/js/checkout.js';
    s.onload = function () { cb(window.JH_CHECKOUT); };
    document.head.appendChild(s);
  }

  window.JH_CHECKOUT = {
    pay: function (opts) { return go('/crear-preferencia', opts, opts && opts.button); },
    load: load,
    backend: BACKEND
  };
})();
