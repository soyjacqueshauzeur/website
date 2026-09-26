/* Per-service contract page — one form + one live contract. Uses JH_CC
   (contract-core.js) for the shared client profile and the document builder.
   Duration is synced with the cart selection for this service (else 1 month). */
(function () {
  'use strict';

  var CC = window.JH_CC;
  var C = window.JH_CONTRACT;
  var root = document.getElementById('contract-app');
  if (!CC || !C || !root) return;

  var L = C.labels;
  var id = root.getAttribute('data-service');
  var profile = CC.loadProfile();

  function cartMonths() {
    var e = CC.cartEntries();
    for (var i = 0; i < e.length; i++) if (e[i].id === id) return e[i].months;
    return null;
  }
  var fromCart = cartMonths();
  var months = (fromCart !== null) ? fromCart : CC.monthsList()[0];

  function durationSelect() {
    var opts = '';
    var ms = CC.monthsList();
    var chips = (window.JH_HIRE && window.JH_HIRE.labels && window.JH_HIRE.labels.monthsChips) || ms;
    for (var i = 0; i < ms.length; i++) {
      opts += '<option value="' + ms[i] + '"' + (Number(months) === ms[i] ? ' selected' : '') + '>' + CC.esc(chips[i] || ms[i]) + '</option>';
    }
    return '<div class="contract-field"><label for="cf-duration">' + CC.esc(L.duration) + ' *</label>' +
      '<select id="cf-duration" name="duration">' + opts + '</select>' +
      '<span class="err" data-err="duration" role="alert"></span></div>';
  }

  root.innerHTML =
    '<div class="contract-grid">' +
      '<form class="contract-form" id="contract-form" novalidate>' +
        '<h2 class="contract-form-title">' + CC.esc(L.formTitle) + '</h2>' +
        '<p class="contract-form-lede">' + CC.esc(L.formLede) + '</p>' +
        (L.requiredNote ? '<p class="contract-required-note">' + CC.esc(L.requiredNote) + '</p>' : '') +
        CC.fieldsHTML(profile) +
        durationSelect() +
        '<div class="contract-actions">' +
          '<button type="submit" class="btn btn--primary btn--lg">' + CC.esc(L.generate) + '</button>' +
          '<button type="button" class="btn btn--dark btn--lg" data-contract-print>' + CC.esc(L.print) + '</button>' +
        '</div>' +
      '</form>' +
      '<div class="contract-preview">' +
        '<span class="label">' + CC.esc(L.previewLabel) + '</span>' +
        '<article class="contract-doc" id="contract-doc" aria-label="' + CC.esc(C.clauses.docAria) + '"></article>' +
      '</div>' +
    '</div>';

  var form = document.getElementById('contract-form');
  var doc = document.getElementById('contract-doc');
  var select = document.getElementById('cf-duration');

  function renderDoc() { doc.innerHTML = CC.buildContractHTML(id, months, profile); }
  function errors() { return CC.validate(profile); }

  CC.bindProfile(form, profile, renderDoc);
  if (select) select.addEventListener('change', function () { months = Number(select.value); renderDoc(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!CC.setErrors(form, errors())) return;
    var prev = document.querySelector('.contract-preview');
    if (prev) {
      prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
      prev.classList.remove('pulse'); void prev.offsetWidth; prev.classList.add('pulse');
    }
  });

  var printBtn = root.querySelector('[data-contract-print]');
  if (printBtn) printBtn.addEventListener('click', function () {
    if (CC.setErrors(form, errors())) { renderDoc(); window.print(); }
  });

  renderDoc();
})();
