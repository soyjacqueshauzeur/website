/* Clases 1:1 (ES) — widget de pago por horas para es/studio.html.
   Reusa los medios de pago y contactos de JH_HIRE (hire-data-es.js) y el
   estilo .hire-* del carrito de contratación mensual. No depende de hire.js. */
(function () {
  'use strict';

  if (!window.JH_HIRE) return;

  var D = window.JH_HIRE;
  var PRICE = 15;           // USD por hora
  var MAX_HOURS = 48;       // máximo de horas al mes (lun–jue × 3/día × ~4 semanas)

  var state = {
    hours: 1,
    payId: D.payments[0] ? D.payments[0].id : null
  };

  function fmt(n) { return '$' + n.toLocaleString('en-US'); }
  function total() { return PRICE * state.hours; }
  function payLabel() {
    for (var i = 0; i < D.payments.length; i++) if (D.payments[i].id === state.payId) return D.payments[i].label;
    return '';
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function clamp(n) { return Math.min(MAX_HOURS, Math.max(1, n)); }

  /* ---------- selector de horas (chips 1–3 + input 4–48) ---------- */
  function setInput(value) {
    var inp = document.querySelector('[data-class-hours-input]');
    if (inp) inp.value = (state.hours >= 4) ? String(state.hours) : '';
  }
  function updatePicker() {
    var group = document.querySelector('[data-class-hours-group]');
    if (group) {
      var chips = group.querySelectorAll('[data-class-hours]');
      for (var i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-pressed', String(Number(chips[i].getAttribute('data-class-hours')) === state.hours));
      }
    }
    setInput(state.hours);
    var tot = document.querySelector('[data-class-total]');
    if (tot) tot.textContent = fmt(total());
  }

  /* ---------- drawer (modal de carrito) ---------- */
  function ensureChrome() {
    if (document.getElementById('class-booking-root')) return;

    var root = document.createElement('div');
    root.id = 'class-booking-root';

    var bubble = document.createElement('div');
    bubble.className = 'hire-bubble';
    bubble.id = 'class-bubble';
    bubble.hidden = true;
    bubble.innerHTML =
      '<button type="button" class="hire-bubble-btn" id="class-bubble-btn" aria-haspopup="dialog" aria-controls="class-cart">' +
        '<span class="hire-bubble-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/></svg></span>' +
        '<span class="hire-bubble-count" id="class-bubble-count">1</span>' +
      '</button>';

    var overlay = document.createElement('div');
    overlay.className = 'hire-overlay';
    overlay.id = 'class-overlay';

    var cart = document.createElement('aside');
    cart.className = 'hire-cart';
    cart.id = 'class-cart';
    cart.setAttribute('role', 'dialog');
    cart.setAttribute('aria-modal', 'true');
    cart.setAttribute('aria-label', 'Tus horas de clase');

    var head = document.createElement('div');
    head.className = 'hire-cart-head';
    head.innerHTML = '<h3>Tus horas de clase</h3><button type="button" class="hire-cart-close" data-class-close>Cerrar \u00d7</button>';
    cart.appendChild(head);

    var body = document.createElement('div');
    body.className = 'hire-cart-body';
    body.id = 'class-cart-body';
    cart.appendChild(body);

    var foot = document.createElement('div');
    foot.className = 'hire-cart-foot';
    foot.id = 'class-cart-foot';
    cart.appendChild(foot);

    root.appendChild(bubble);
    root.appendChild(overlay);
    root.appendChild(cart);
    document.body.appendChild(root);

    var toast = document.createElement('div');
    toast.className = 'hire-toast';
    toast.id = 'class-toast';
    document.body.appendChild(toast);
  }

  function hourLabel(h) { return h + (h === 1 ? ' hora' : ' horas'); }

  function cartBodyHTML() {
    var h = hourLabel(state.hours);
    var chips = '';
    for (var i = 1; i <= 3; i++) {
      chips += '<button type="button" class="hire-month" data-class-cart-hours="' + i + '" aria-pressed="' + (state.hours === i) + '">' + i + ' hora' + (i === 1 ? '' : 's') + '</button>';
    }
    return (
      '<div class="hire-line" data-line-root="class">' +
        '<div class="hire-line-top">' +
          '<b>Clase 1:1</b>' +
          '<button type="button" class="hire-line-x" data-class-clear aria-label="Quitar" title="Quitar">\u2715</button>' +
        '</div>' +
        '<div class="hire-line-dur" role="group" aria-label="Horas en total">' + chips + '</div>' +
        '<div class="hire-line-meta">' +
          '<span class="hlm-rate">' + fmt(PRICE) + '<i>/hora</i></span>' +
          '<span class="hlm-mid">' + h + '</span>' +
          '<b class="hlm-total">' + fmt(total()) + '</b>' +
        '</div>' +
      '</div>' +
      '<div class="hire-summary-total">' +
        '<div class="hire-sum-row total"><span>Total a pagar</span><b data-class-cart-total>' + fmt(total()) + '</b></div>' +
        '<p class="hire-foot-note">Precios en USD. Máximo 3 horas por día, lunes a jueves. Los viernes la clase es gratis.</p>' +
      '</div>'
    );
  }

  function cartFootHTML() {
    var opts = '';
    for (var i = 0; i < D.payments.length; i++) {
      var p = D.payments[i];
      var sel = p.id === state.payId ? ' sel' : '';
      opts +=
        '<label class="hire-pay-opt' + sel + '">' +
          '<input type="radio" name="class-pay" value="' + p.id + '"' + (p.id === state.payId ? ' checked' : '') + ' />' +
          '<span class="hpo-radio" aria-hidden="true"></span>' +
          '<span class="hpo-txt"><b>' + p.label + '</b><span>' + p.note + '</span></span>' +
        '</label>';
    }
    return (
      '<span class="hire-pay-title">¿Cómo quieres pagar?</span>' +
      '<div class="hire-pay-opts">' + opts + '</div>' +
      '<button type="button" class="btn btn--primary btn--lg" data-class-wa>' + 'Enviar y pagar por WhatsApp' + arrow() + '</button>' +
      '<button type="button" class="btn hire-tg-btn btn--lg" data-class-tg>' + 'Enviar por Telegram' + arrow() + '</button>' +
      '<p class="hire-foot-note hire-foot-note--pay">Después de pagar, envía tu comprobante en el chat para confirmar tu reserva.</p>'
    );
  }

  function arrow() {
    return '<svg class="arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function updateUI() {
    var bub = document.getElementById('class-bubble');
    if (bub) bub.hidden = false;
    var body = document.getElementById('class-cart-body');
    if (body) body.innerHTML = cartBodyHTML();
    var foot = document.getElementById('class-cart-foot');
    if (foot) foot.innerHTML = cartFootHTML();
  }

  function toast(msg) {
    var el = document.getElementById('class-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2000);
  }

  function popBubble() {
    var bub = document.getElementById('class-bubble');
    if (!bub) return;
    bub.classList.remove('bubble-pop');
    void bub.offsetWidth;
    bub.classList.add('bubble-pop');
  }

  function openCart() {
    var cart = document.getElementById('class-cart');
    var overlay = document.getElementById('class-overlay');
    if (cart) cart.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    var cart = document.getElementById('class-cart');
    var overlay = document.getElementById('class-overlay');
    if (cart) cart.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function setHours(h, from) {
    state.hours = clamp(Number(h) || 1);
    updatePicker();
    updateUI();
    if (from !== 'cart') toast('Seleccionaste ' + hourLabel(state.hours));
  }

  function buildMessage() {
    var lines = [];
    lines.push('Hola Jacques, quiero agendar clases 1:1 de pago:');
    lines.push('- ' + hourLabel(state.hours) + ' en total \u00d7 ' + fmt(PRICE) + '/hora = ' + fmt(total()));
    lines.push('Total a pagar: ' + fmt(total()));
    lines.push('Pago con: ' + payLabel());
    lines.push('Te adjunto mi comprobante de pago para confirmar la reserva. ¡Gracias!');
    return lines.join('\n');
  }
  function sendWhatsApp() {
    var text = encodeURIComponent(buildMessage());
    window.open('https://wa.me/' + D.whatsapp + '?text=' + text, '_blank', 'noopener');
  }
  function sendTelegram() {
    window.open('https://t.me/' + D.telegram, '_blank', 'noopener');
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var chip = t.closest('[data-class-hours]');
    if (chip) { setHours(chip.getAttribute('data-class-hours')); return; }

    var add = t.closest('[data-class-add]');
    if (add) { e.preventDefault(); ensureChrome(); updateUI(); openCart(); popBubble(); return; }

    var cchip = t.closest('[data-class-cart-hours]');
    if (cchip) { setHours(cchip.getAttribute('data-class-cart-hours'), 'cart'); return; }

    var clear = t.closest('[data-class-clear]');
    if (clear) { state.hours = 1; updatePicker(); updateUI(); closeCart(); toast('Horas eliminadas'); return; }

    var openBtn = t.closest('#class-bubble-btn');
    if (openBtn) { openCart(); return; }

    var closeBtn = t.closest('[data-class-close]');
    if (closeBtn) { closeCart(); return; }

    if (t.closest('#class-overlay')) { closeCart(); return; }

    var pay = t.closest('.hire-pay-opt');
    if (pay) {
      var input = pay.querySelector('input');
      if (input) input.checked = true;
      state.payId = input ? input.value : state.payId;
      var all = document.querySelectorAll('.hire-pay-opt');
      for (var i = 0; i < all.length; i++) all[i].classList.toggle('sel', all[i] === pay);
      return;
    }

    if (t.closest('[data-class-wa]')) { sendWhatsApp(); return; }
    if (t.closest('[data-class-tg]')) { sendTelegram(); return; }
  }

  function onInput(e) {
    var t = e.target;
    if (!t || !t.matches) return;
    if (t.matches('[data-class-hours-input]')) {
      var v = parseInt(t.value, 10);
      if (t.value === '') { return; }
      setHours(isNaN(v) ? state.hours : v);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') closeCart();
  }

  ready(function () {
    updatePicker();
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
  });
})();
