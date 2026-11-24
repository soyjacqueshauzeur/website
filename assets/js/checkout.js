/* Cliente compartido de MercadoPago (Checkout Pro — pago único del total).
   El backend resuelve los precios desde su catálogo; el navegador solo manda
   ids + cantidades + datos del comprador.

   Configuración:
     window.JH_CHECKOUT_BACKEND = 'https://...'   // opcional, para cambiarlo
*/
(function () {
  'use strict';

  /* Mismo backend y misma cuenta de MercadoPago que lemonshake (áreas
     `services` y `sessions`). */
  var DEFAULT_BACKEND = 'https://lemonshake-payments.lemonshake-payments.workers.dev';
  var BACKEND = (window.JH_CHECKOUT_BACKEND || DEFAULT_BACKEND).replace(/\/$/, '');
  var inFlight = false;

  function newKey() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'k' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function firstError(r) {
    if (!r) return 'No se pudo iniciar el pago.';
    if (r.error) return r.error;
    return 'No se pudo iniciar el pago.';
  }

  function go(opts) {
    opts = opts || {};
    if (!opts.area || !Array.isArray(opts.items) || !opts.items.length) {
      return Promise.reject(new Error('Falta el área o los productos.'));
    }
    if (!opts.customer || !opts.customer.email) {
      return Promise.reject(new Error('Falta el correo del comprador.'));
    }
    if (inFlight) return Promise.reject(new Error('Ya hay un pago en curso.'));

    var button = opts.button || null;
    inFlight = true;
    if (button) {
      button.disabled = true;
      button.setAttribute('data-label', button.textContent || '');
      button.textContent = 'Procesando…';
    }

    var restore = function () {
      inFlight = false;
      if (button) {
        button.disabled = false;
        var label = button.getAttribute('data-label');
        if (label) button.textContent = label;
      }
    };

    var key = newKey();
    var body = {
      area: opts.area,
      items: opts.items,
      customer: opts.customer,
      shipping: opts.shipping || {},
      marketing: opts.marketing || {},
      consent: opts.consent || { data: true, terms: true },
      clientTotal: opts.clientTotal,
      idempotencyKey: key
    };

    return fetch(BACKEND + '/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': key
      },
      body: JSON.stringify(body)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          return { status: r.status, data: data };
        });
      })
      .then(function (res) {
        var r = res.data || {};
        if (!r.ok || !(r.initPoint || r.init_point)) {
          restore();
          var err = new Error(firstError(r));
          err.code = r.code || null;
          err.status = res.status;
          throw err;
        }

        /* Red de seguridad: nunca cobrar un total distinto al mostrado. */
        if (opts.expectedTotal != null && r.total != null && Number(r.total) !== Number(opts.expectedTotal)) {
          restore();
          var priceErr = new Error('El precio cambió. Actualiza la página antes de pagar.');
          priceErr.code = 'price_changed';
          throw priceErr;
        }

        try {
          sessionStorage.setItem('jh-order-id', r.orderId || '');
          if (r.orderToken) sessionStorage.setItem('jh-order-token', r.orderToken);
          sessionStorage.setItem('jh-order-total', String(r.total || ''));
        } catch (e) {}

        window.location.assign(r.initPoint || r.init_point);
        return r;
      })
      .catch(function (err) {
        restore();
        throw err;
      });
  }

  /* Carga perezosa para páginas que no incluyen este archivo. */
  function load(cb) {
    if (window.JH_CHECKOUT) {
      if (cb) cb(window.JH_CHECKOUT);
      return;
    }
    var s = document.createElement('script');
    s.src = '/assets/js/checkout.js';
    s.onload = function () { if (cb) cb(window.JH_CHECKOUT); };
    s.onerror = function () { if (cb) cb(null); };
    document.head.appendChild(s);
  }

  window.JH_CHECKOUT = {
    pay: function (opts) { return go(opts); },
    load: load,
    backend: BACKEND
  };
})();
