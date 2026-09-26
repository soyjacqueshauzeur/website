/* Cart-wide contract page — one form for the whole cart, then one contract per
   service with its own download button (plus "Download all"). Uses JH_CC
   (contract-core.js). Services and months come from the cart (hire data). */
(function () {
  'use strict';

  var CC = window.JH_CC;
  var C = window.JH_CONTRACT;
  var root = document.getElementById('contract-app');
  if (!CC || !C || !root) return;

  var L = C.labels;
  var entries = CC.cartEntries();
  if (!entries.length) { window.location.replace('services.html'); return; }

  var profile = CC.loadProfile();

  function validNow() { return Object.keys(CC.validate(profile)).length === 0; }
  function summaryText() {
    var parts = [profile.fullName, profile.company, profile.whatsapp, profile.country, profile.email];
    return parts.filter(function (p) { return p && String(p).trim(); }).join(' · ');
  }

  var formHTML =
    '<form class="contract-form contract-form--multi" id="contract-form" novalidate>' +
      '<h2 class="contract-form-title">' + CC.esc(L.formTitle) + '</h2>' +
      '<p class="contract-form-lede">' + CC.esc(L.formLede) + '</p>' +
      (L.requiredNote ? '<p class="contract-required-note">' + CC.esc(L.requiredNote) + '</p>' : '') +
      CC.fieldsHTML(profile) +
      '<div class="contract-actions">' +
        '<button type="submit" class="btn btn--primary btn--lg">' + CC.esc(L.generate) + '</button>' +
      '</div>' +
    '</form>';

  var downloads = entries.map(function (e) {
    var s = CC.serviceById(e.id);
    return '<button type="button" class="btn btn--primary btn--sm" data-print-one="' + e.id + '">' +
      CC.esc(L.downloadOne) + ': ' + CC.esc(s.category) + '</button>';
  }).join('');
  if (entries.length > 1) {
    downloads += '<button type="button" class="btn btn--dark btn--sm" data-print-all>' + CC.esc(L.downloadAll) + '</button>';
  }

  var docs = entries.map(function (e) {
    var s = CC.serviceById(e.id);
    return '<article class="contract-doc" data-contract="' + e.id + '" aria-label="' + CC.esc(C.clauses.docAria) + ' — ' + CC.esc(s.category) + '"></article>';
  }).join('');

  root.innerHTML =
    '<div class="contract-multi">' +
      '<div class="contract-multi-top">' +
        formHTML +
        '<div class="contract-summary" hidden>' +
          '<span class="label">' + CC.esc(L.yourData) + '</span>' +
          '<p class="contract-summary-text"></p>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-contract-edit>' + CC.esc(L.editData) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="contract-results" hidden>' +
        '<div class="contract-downloads">' +
          '<span class="label">' + CC.esc(L.downloadOne) + '</span>' +
          '<div class="contract-downloads-row">' + downloads + '</div>' +
        '</div>' +
        '<div class="contract-docs">' + docs + '</div>' +
      '</div>' +
    '</div>';

  var form = document.getElementById('contract-form');
  var summary = root.querySelector('.contract-summary');
  var results = root.querySelector('.contract-results');
  var docsWrap = root.querySelector('.contract-docs');

  function renderDocs() {
    entries.forEach(function (e) {
      var el = docsWrap.querySelector('.contract-doc[data-contract="' + e.id + '"]');
      if (el) el.innerHTML = CC.buildContractHTML(e.id, e.months, profile);
    });
  }
  function showSummary() {
    var t = summary.querySelector('.contract-summary-text');
    if (t) t.textContent = summaryText();
  }

  function reveal() {
    showSummary();
    renderDocs();
    form.hidden = true;
    summary.hidden = false;
    results.hidden = false;
  }

  CC.bindProfile(form, profile, function () { if (!form.hidden) renderDocs(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!CC.setErrors(form, CC.validate(profile))) return;
    reveal();
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  summary.querySelector('[data-contract-edit]').addEventListener('click', function () {
    summary.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function cleanupPrint() {
    document.body.classList.remove('printing-one');
    var ds = docsWrap.querySelectorAll('.contract-doc');
    for (var i = 0; i < ds.length; i++) ds[i].classList.remove('print-target');
  }
  function printOne(id) {
    var ds = docsWrap.querySelectorAll('.contract-doc');
    for (var i = 0; i < ds.length; i++) {
      ds[i].classList.toggle('print-target', ds[i].getAttribute('data-contract') === id);
    }
    document.body.classList.add('printing-one');
    window.print();
    window.addEventListener('afterprint', cleanupPrint, { once: true });
    setTimeout(cleanupPrint, 1500);
  }

  root.querySelectorAll('[data-print-one]').forEach(function (b) {
    b.addEventListener('click', function () { printOne(b.getAttribute('data-print-one')); });
  });
  var allBtn = root.querySelector('[data-print-all]');
  if (allBtn) allBtn.addEventListener('click', function () { cleanupPrint(); window.print(); });

  if (validNow()) reveal();
})();
