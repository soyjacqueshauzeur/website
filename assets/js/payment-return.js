/*
 * assets/js/payment-return.js — aviso del resultado del pago (MercadoPago).
 *
 * Las back_urls de Checkout Pro devuelven por GET: status / collection_status,
 * payment_id, external_reference, payment_type. También soporta el fallback
 * ?pago=ok|error que envía el Worker. Muestra un aviso EN/ES según <html lang>.
 *
 * Idempotente y silencioso: si no hay parámetros de pago, no hace nada.
 */
(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  var ES = LANG === 'es';

  var T = {
    approved: {
      title: ES ? 'Pago aprobado' : 'Payment approved',
      body: ES
        ? '¡Listo! Recibimos tu pago. Te escribo para coordinar los siguientes pasos.'
        : 'Done! We received your payment. I\u2019ll reach out to coordinate the next steps.'
    },
    pending: {
      title: ES ? 'Pago pendiente' : 'Payment pending',
      body: ES
        ? 'Tu pago quedó pendiente de confirmaci\u00f3n. Te aviso por WhatsApp/Telegram cuando se acredite.'
        : 'Your payment is pending confirmation. I\u2019ll let you know by WhatsApp/Telegram once it clears.'
    },
    error: {
      title: ES ? 'El pago no se complet\u00f3' : 'Payment not completed',
      body: ES
        ? 'El pago fue rechazado o cancelado. Puedes intentarlo de nuevo; no se hizo ning\u00fan cargo.'
        : 'The payment was rejected or cancelled. You can try again; nothing was charged.'
    }
  };

  function classify(params) {
    var s = (params.get('collection_status') || params.get('status') || '').toLowerCase();
    var pago = (params.get('pago') || '').toLowerCase();
    if (s === 'approved' || pago === 'ok') return 'approved';
    if (s === 'pending' || s === 'in_process' || s === 'authorized') return 'pending';
    if (s === 'rejected' || s === 'cancelled' || s === 'canceled' || s === 'failure' || pago === 'error') return 'error';
    return null;
  }

  var COLORS = { approved: '#9CCB1F', pending: '#D4FF3D', error: '#FF6B6B' };
  var ICONS = {
    approved: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    pending: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
  };

  function build(kind, params) {
    var color = COLORS[kind];
    var box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('data-payment-banner', kind);
    box.style.cssText = [
      'display:flex', 'gap:12px', 'align-items:flex-start',
      'max-width:760px', 'margin:16px auto 0',
      'padding:14px 16px', 'border-radius:14px',
      'background:rgba(10,10,12,.06)', 'border:1px solid rgba(148,148,148,.35)',
      'border-left:4px solid ' + color,
      'color:inherit', 'font:inherit', 'line-height:1.45'
    ].join(';');

    var icon = document.createElement('span');
    icon.innerHTML = ICONS[kind];
    icon.style.cssText = 'flex:0 0 auto;color:' + color + ';margin-top:2px';

    var text = document.createElement('div');
    var h = document.createElement('strong');
    h.textContent = T[kind].title;
    h.style.cssText = 'display:block';
    var p = document.createElement('span');
    p.textContent = T[kind].body;
    text.appendChild(h);
    text.appendChild(p);

    var ref = params.get('payment_id') || params.get('collection_id');
    if (ref && kind !== 'pending') {
      var small = document.createElement('small');
      small.textContent = (ES ? 'Referencia: ' : 'Reference: ') + ref;
      small.style.cssText = 'display:block;opacity:.6;margin-top:4px;font-size:.8em';
      text.appendChild(small);
    }

    box.appendChild(icon);
    box.appendChild(text);
    return box;
  }

  function render() {
    var params = new URLSearchParams(window.location.search);
    var kind = classify(params);
    if (!kind) return;
    if (document.querySelector('[data-payment-banner]')) return;

    // Limpia parámetros de pago de la URL (evita re-mostrar / recompartir).
    if (window.history && history.replaceState) {
      try {
        params.delete('status'); params.delete('collection_status');
        params.delete('payment_id'); params.delete('collection_id');
        params.delete('external_reference'); params.delete('payment_type');
        params.delete('merchant_order_id'); params.delete('preference_id');
        params.delete('site_id'); params.delete('processing_mode');
        params.delete('merchant_account_id'); params.delete('pago');
        var qs = params.toString();
        history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
      } catch (e) {}
    }

    var host = document.querySelector('[data-payment-status]');
    var banner = build(kind, params);
    if (host) { host.appendChild(banner); return; }
    var main = document.querySelector('main') || document.body;
    main.insertBefore(banner, main.firstChild);
    banner.style.marginTop = '0';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
})();
