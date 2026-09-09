/* Monthly-hire cart — drives the catalogue, price panels, floating bubble and
   cart drawer. Reads JH_HIRE (hire-data*.js). Vanilla JS, localStorage cart. */
(function () {
  'use strict';

  if (!window.JH_HIRE) return;

  var D = window.JH_HIRE;
  var L = D.labels;
  var MSG = D.message;
  var KEY = 'jh-hire-cart-v1';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var state = {
    cart: load(),
    payId: D.payments[0] ? D.payments[0].id : null,
    panelSel: {},
    items: 0
  };

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state.cart)); } catch (e) {}
  }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function (l) { return l && l.id && l.months; }) : [];
    } catch (e) { return []; }
  }
  function svc(id) {
    for (var i = 0; i < D.services.length; i++) if (D.services[i].id === id) return D.services[i];
    return null;
  }
  function fmt(n) { return '$' + n.toLocaleString('en-US'); }
  function AX(n) { return (window.JH_FX && window.JH_FX.approxNode) ? window.JH_FX.approxNode(n) : ''; }
  function AXID(n, id) {
    if (!(window.JH_FX && window.JH_FX.approxNode)) return '';
    return '<span class="price-approx" data-approx="' + n + '" data-approx-id="' + id + '"></span>';
  }
  function renderFX() {
    if (window.JH_FX && window.JH_FX.renderApproxNodes) window.JH_FX.renderApproxNodes();
  }
  function renderNodeFX(id, amount) {
    if (!window.JH_FX) return;
    var el = document.querySelector('[data-approx-id="' + id + '"]');
    if (!el) return;
    el.setAttribute('data-approx', amount);
    window.JH_FX.renderApproxNodes();
  }
  function payLabel() {
    for (var i = 0; i < D.payments.length; i++) if (D.payments[i].id === state.payId) return D.payments[i].label;
    return '';
  }
  function total() {
    return state.cart.reduce(function (sum, l) { return sum + (svc(l.id) ? svc(l.id).price * l.months : 0); }, 0);
  }
  function monthIndex(m) { return Math.max(0, D.months.indexOf(m)); }

  function addToCart(id, months, opts) {
    var m = D.months.indexOf(months) !== -1 ? months : D.months[0];
    var found = false;
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === id) {
        state.cart[i].months = (opts && opts.increment) ? state.cart[i].months + m : m;
        found = true;
        break;
      }
    }
    if (!found) state.cart.push({ id: id, months: m });
    save();
    updateUI();
    popBubble();
    if (!(opts && opts.silent)) toast(L.added);
  }
  function setMonths(id, months) {
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === id) { state.cart[i].months = months; break; }
    }
    save();
    updateUI();
  }
  function removeItem(id) {
    state.cart = state.cart.filter(function (l) { return l.id !== id; });
    save();
    updateUI();
  }
  function countLines() { return state.cart.length; }

  function lineTotal(l) { var s = svc(l.id); return s ? s.price * l.months : 0; }

  /* ---------------- catalogue cards ---------------- */
  function arrow() {
    return '<svg class="arrow" width="13" height="9" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function cardHTML(s) {
    return (
      '<article class="cap-card cat-card">' +
        '<a class="cat-card-link" href="' + s.file + '"><span class="cap-num">' + s.num + ' / ' + s.category + '</span></a>' +
        '<h3 class="cat-card-title"><a href="' + s.file + '">' + s.cardTitle + '</a></h3>' +
        '<p class="cat-card-desc">' + s.cardDesc + '</p>' +
        '<div class="cat-card-foot">' +
          '<div class="cat-card-price"><b>' + fmt(s.price) + '</b><span>' + L.priceMonth + '</span>' + AX(s.price) + '</div>' +
          '<a class="btn btn--hire" href="' + s.file + '" data-hire-goto="' + s.id + '" aria-label="' + L.hire + ' ' + s.category + '">' + L.hire + arrow() + '</a>' +
        '</div>' +
        '<span class="label cat-card-tags">' + s.tags + '</span>' +
      '</article>'
    );
  }

  function renderCatalogues() {
    var roots = document.querySelectorAll('[data-hire-catalogue]');
    for (var r = 0; r < roots.length; r++) {
      var exclude = roots[r].getAttribute('data-exclude');
      var html = '';
      for (var i = 0; i < D.services.length; i++) {
        if (D.services[i].id === exclude) continue;
        html += cardHTML(D.services[i]);
      }
      roots[r].innerHTML = html;
    }
    renderFX();
  }

  /* ---------------- price panel (service page) ---------------- */
  function panelHTML(s, sel) {
    var chips = '';
    for (var i = 0; i < D.months.length; i++) {
      var m = D.months[i];
      chips += '<button type="button" class="hire-month" data-panel-month="' + m + '" aria-pressed="' + (m === sel) + '">' + L.monthsChips[i] + '</button>';
    }
    return (
      '<div class="hire-panel">' +
        '<div class="hire-panel-head"><span class="cap-num">' + s.num + ' / ' + s.category + '</span><span class="pay-chip">' + L.everyMonth + '</span></div>' +
        '<div class="hire-panel-price"><b>' + fmt(s.price) + '</b><span>' + L.priceMonth + '</span></div>' +
        AX(s.price) +
        '<div class="hire-panel-fx" data-fx-anchor></div>' +
        '<p class="hire-panel-desc">' + s.cardDesc + '</p>' +
        '<span class="label" style="color: var(--fg-mute);">' + L.durationPick + '</span>' +
        '<div class="hire-months" role="group" aria-label="' + L.duration + '">' + chips + '</div>' +
        '<div class="hire-panel-total"><span>' + L.total + '</span><b data-panel-total>' + fmt(s.price * sel) + '</b></div>' +
        AXID(s.price * sel, 'panel-' + s.id) +
        '<button type="button" class="btn btn--primary btn--lg" data-panel-add="' + s.id + '">' + L.add + arrow() + '</button>' +
        '<p class="hire-mini-note">' + L.billingNote + '</p>' +
      '</div>'
    );
  }

  function renderPanels() {
    var roots = document.querySelectorAll('[data-hire-panel]');
    for (var r = 0; r < roots.length; r++) {
      var id = roots[r].getAttribute('data-hire-panel');
      var s = svc(id);
      if (!s) continue;
      if (state.panelSel[id] === undefined) state.panelSel[id] = D.months[0];
      roots[r].innerHTML = panelHTML(s, state.panelSel[id]);
    }
    renderFX();
    if (roots.length && window.JH_FX && window.JH_FX.picker) window.JH_FX.picker();
  }

  function setPanelMonths(id, m) {
    state.panelSel[id] = m;
    var root = document.querySelector('[data-hire-panel="' + id + '"]');
    if (!root) return;
    var chips = root.querySelectorAll('[data-panel-month]');
    for (var i = 0; i < chips.length; i++) chips[i].setAttribute('aria-pressed', String(Number(chips[i].getAttribute('data-panel-month')) === m));
    var s = svc(id);
    var tot = root.querySelector('[data-panel-total]');
    if (s && tot) tot.textContent = fmt(s.price * m);
    renderNodeFX('panel-' + id, s ? s.price * m : 0);
  }

  /* ---------------- floating bubble + drawer chrome ---------------- */
  function ensureChrome() {
    if (document.getElementById('hire-cart-root')) return;

    var root = document.createElement('div');
    root.id = 'hire-cart-root';

    var bubble = document.createElement('div');
    bubble.className = 'hire-bubble';
    bubble.id = 'hire-bubble';
    bubble.hidden = true;
    bubble.innerHTML =
      '<button type="button" class="hire-bubble-btn" id="hire-bubble-btn" aria-haspopup="dialog" aria-controls="hire-cart">' +
        '<span class="hire-bubble-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h2l2.2 11.2A2 2 0 0 0 9.16 19h8.3a2 2 0 0 0 1.94-1.51L21 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="21" r="1" fill="currentColor"/><circle cx="17.5" cy="21" r="1" fill="currentColor"/></svg></span>' +
        '<span class="hire-bubble-count" id="hire-bubble-count">0</span>' +
      '</button>';

    var overlay = document.createElement('div');
    overlay.className = 'hire-overlay';
    overlay.id = 'hire-overlay';

    var cart = document.createElement('aside');
    cart.className = 'hire-cart';
    cart.id = 'hire-cart';
    cart.setAttribute('role', 'dialog');
    cart.setAttribute('aria-modal', 'true');
    cart.setAttribute('aria-label', L.cartTitle);

    var head = document.createElement('div');
    head.className = 'hire-cart-head';
    head.innerHTML = '<h3>' + L.cartTitle + '</h3><button type="button" class="hire-cart-close" data-cart-close>' + L.cancel + ' \u00d7</button>';
    cart.appendChild(head);

    var body = document.createElement('div');
    body.className = 'hire-cart-body';
    body.id = 'hire-cart-body';
    cart.appendChild(body);

    var foot = document.createElement('div');
    foot.className = 'hire-cart-foot';
    foot.id = 'hire-cart-foot';
    cart.appendChild(foot);

    root.appendChild(bubble);
    root.appendChild(overlay);
    root.appendChild(cart);
    document.body.appendChild(root);

    var toast = document.createElement('div');
    toast.className = 'hire-toast';
    toast.id = 'hire-toast';
    document.body.appendChild(toast);
  }

  function monthChipsHTML(l) {
    var chips = '';
    for (var j = 0; j < D.months.length; j++) {
      var m = D.months[j];
      chips += '<button type="button" class="hire-month" data-cart-month="' + m + '" aria-pressed="' + (m === l.months) + '" data-line="' + l.id + '">' + L.monthsChips[j] + '</button>';
    }
    return chips;
  }
  function monthLabel(m) {
    var i = monthIndex(m);
    return L.monthsChips[i];
  }

  function cartBodyHTML() {
    if (!state.cart.length) return '<p class="hire-empty">' + L.empty + '</p>';
    var html = '';
    for (var i = 0; i < state.cart.length; i++) {
      var l = state.cart[i];
      var s = svc(l.id);
      if (!s) continue;
      html +=
        '<div class="hire-line" data-line-root="' + l.id + '">' +
          '<div class="hire-line-top">' +
            '<b>' + s.category + '</b>' +
            '<button type="button" class="hire-line-x" data-remove="' + l.id + '" aria-label="' + L.remove + ': ' + s.category + '" title="' + L.remove + '">\u2715</button>' +
          '</div>' +
          '<div class="hire-line-dur" role="group" aria-label="' + L.duration + '">' + monthChipsHTML(l) + '</div>' +
          '<div class="hire-line-meta">' +
            '<span class="hlm-rate">' + fmt(s.price) + '<i>' + L.priceMonth + '</i>' + AX(s.price) + '</span>' +
            '<span class="hlm-mid">' + monthLabel(l.months) + '</span>' +
            '<b class="hlm-total">' + fmt(lineTotal(l)) + AX(lineTotal(l)) + '</b>' +
          '</div>' +
        '</div>';
    }
    html +=
      '<div class="hire-summary-total">' +
        '<div class="hire-sum-row total"><span>' + L.total + '</span><b data-cart-total>' + fmt(total()) + AX(total()) + '</b></div>' +
        '<p class="hire-foot-note">' + L.billingNote + '</p>' +
      '</div>';
    return html;
  }

  function cartFootHTML() {
    if (!state.cart.length) return '';
    var opts = '';
    for (var i = 0; i < D.payments.length; i++) {
      var p = D.payments[i];
      var sel = p.id === state.payId ? ' sel' : '';
      opts +=
        '<label class="hire-pay-opt' + sel + '">' +
          '<input type="radio" name="hire-pay" value="' + p.id + '"' + (p.id === state.payId ? ' checked' : '') + ' />' +
          '<span class="hpo-radio" aria-hidden="true"></span>' +
          '<span class="hpo-txt"><b>' + p.label + '</b><span>' + p.note + '</span></span>' +
        '</label>';
    }
    return (
      '<span class="hire-pay-title">' + L.paymentTitle + '</span>' +
      '<div class="hire-pay-opts">' + opts + '</div>' +
      '<button type="button" class="btn btn--primary btn--lg" data-wa-send>' + L.wa + arrow() + '</button>' +
      '<button type="button" class="btn hire-tg-btn btn--lg" data-tg-send>' + L.tg + arrow() + '</button>' +
      '<p class="hire-foot-note hire-foot-note--pay">' + L.waNote + '</p>'
    );
  }

  function updateUI() {
    var n = countLines();
    var bub = document.getElementById('hire-bubble');
    if (bub) {
      var cnt = document.getElementById('hire-bubble-count');
      if (cnt) cnt.textContent = n;
      bub.hidden = n === 0;
    }
    var body = document.getElementById('hire-cart-body');
    if (body) body.innerHTML = cartBodyHTML();
    var foot = document.getElementById('hire-cart-foot');
    if (foot) foot.innerHTML = cartFootHTML();
    renderFX();
    saveQuoteFX();
  }

  /* Persist a structured quote (jh-pay-quote) for later gateway calls. */
  function saveQuoteFX() {
    if (!window.JH_FX || !window.JH_FX.saveQuote) return;
    var items = [];
    for (var i = 0; i < state.cart.length; i++) {
      var l = state.cart[i];
      var s = svc(l.id);
      if (!s) continue;
      items.push({
        id: s.id,
        name: s.category,
        qty: l.months,
        usdTotal: lineTotal(l)
      });
    }
    if (items.length) window.JH_FX.saveQuote(items);
    else window.JH_FX.clearQuote();
  }

  function popBubble() {
    var bub = document.getElementById('hire-bubble');
    if (!bub) return;
    bub.classList.remove('bubble-pop');
    void bub.offsetWidth;
    bub.classList.add('bubble-pop');
  }

  function toast(msg) {
    var el = document.getElementById('hire-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }

  function openCart() {
    var cart = document.getElementById('hire-cart');
    var overlay = document.getElementById('hire-overlay');
    if (cart) cart.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    var cart = document.getElementById('hire-cart');
    var overlay = document.getElementById('hire-overlay');
    if (cart) cart.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------------- order message ---------------- */
  function buildMessage() {
    var lines = [MSG.hi];
    for (var i = 0; i < state.cart.length; i++) {
      var l = state.cart[i];
      var s = svc(l.id);
      if (!s) continue;
      lines.push(MSG.line(s.category, l.months, fmt(s.price), fmt(lineTotal(l))));
    }
    lines.push('');
    lines.push(MSG.total + fmt(total()));
    lines.push(MSG.payWith + payLabel());
    lines.push(MSG.sendLink);
    return lines.join('\n');
  }
  function sendWhatsApp() {
    var text = encodeURIComponent(buildMessage());
    window.open('https://wa.me/' + D.whatsapp + '?text=' + text, '_blank', 'noopener');
  }
  function sendTelegram() {
    window.open('https://t.me/' + D.telegram, '_blank', 'noopener');
  }

  /* ---------------- events (delegated) ---------------- */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var goto = t.closest('[data-hire-goto]');
    if (goto) {
      var gid = goto.getAttribute('data-hire-goto');
      var has = false;
      for (var g = 0; g < state.cart.length; g++) if (state.cart[g].id === gid) has = true;
      if (!has) addToCart(gid, D.months[0], { silent: true });
      return;
    }

    var add = t.closest('[data-hire-add]');
    if (add) {
      e.preventDefault();
      addToCart(add.getAttribute('data-hire-add'), D.months[0]);
      return;
    }

    var panelAdd = t.closest('[data-panel-add]');
    if (panelAdd) {
      e.preventDefault();
      var pid = panelAdd.getAttribute('data-panel-add');
      addToCart(pid, state.panelSel[pid] !== undefined ? state.panelSel[pid] : D.months[0]);
      openCart();
      return;
    }

    var pm = t.closest('[data-panel-month]');
    if (pm) {
      var root = pm.closest('[data-hire-panel]');
      if (root) {
        var sid = root.getAttribute('data-hire-panel');
        setPanelMonths(sid, Number(pm.getAttribute('data-panel-month')));
      }
      return;
    }

    var cm = t.closest('[data-cart-month]');
    if (cm) {
      setMonths(cm.getAttribute('data-line'), Number(cm.getAttribute('data-cart-month')));
      return;
    }

    var rm = t.closest('[data-remove]');
    if (rm) {
      removeItem(rm.getAttribute('data-remove'));
      return;
    }

    var openBtn = t.closest('[data-hire-open]');
    if (openBtn) {
      e.preventDefault();
      openCart();
      return;
    }

    var closeBtn = t.closest('[data-cart-close]');
    if (closeBtn) { closeCart(); return; }

    var overlay = t.closest('#hire-overlay');
    if (overlay) { closeCart(); return; }

    var bub = t.closest('#hire-bubble-btn');
    if (bub) { openCart(); return; }

    var pay = t.closest('.hire-pay-opt');
    if (pay) {
      var input = pay.querySelector('input');
      if (input) input.checked = true;
      state.payId = input ? input.value : state.payId;
      var all = document.querySelectorAll('.hire-pay-opt');
      for (var i = 0; i < all.length; i++) all[i].classList.toggle('sel', all[i] === pay);
      return;
    }

    if (t.closest('[data-wa-send]')) { sendWhatsApp(); return; }
    if (t.closest('[data-tg-send]')) { sendTelegram(); return; }
  }

  function onKey(e) {
    if (e.key === 'Escape') closeCart();
  }

  ready(function () {
    ensureChrome();
    renderCatalogues();
    renderPanels();
    updateUI();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    if (window.JH_FX) {
      window.JH_FX.ready(function () { renderFX(); saveQuoteFX(); });
      document.addEventListener('jh:fxchange', function () { renderFX(); saveQuoteFX(); });
    }
  });
})();
