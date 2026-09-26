/* Contract core — shared by the per-service contract pages (contract.js) and
   the cart-wide page (contract-multi.js). Reads JH_CONTRACT (legal text, labels)
   and JH_HIRE (service name, price, scope, months). Holds the single client
   profile shared across every language/page. Vanilla JS, ES/EN via data. */
(function () {
  'use strict';

  var C = window.JH_CONTRACT;
  var H = window.JH_HIRE;
  if (!C) return;

  var PROFILE_KEY = 'jh-contract-profile';
  var BLANK = '________________';
  var REQUIRED_CLIENT = { fullName: 1, country: 1, email: 1, whatsapp: 1 };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function serviceById(id) {
    if (!H || !H.services) return null;
    for (var i = 0; i < H.services.length; i++) if (H.services[i].id === id) return H.services[i];
    return null;
  }
  function monthsList() { return (H && H.months) ? H.months : [1, 3, 6, 12]; }
  function priceStr(id) { var s = serviceById(id); return s ? 'USD $' + Number(s.price).toLocaleString('en-US') : ''; }
  function durationLabel(m) {
    var n = Number(m);
    if (C.labels.durationWords && C.labels.durationWords[n]) return C.labels.durationWords[n];
    var chips = (H && H.labels && H.labels.monthsChips) ? H.labels.monthsChips : [];
    var i = monthsList().indexOf(n);
    return chips[i] || (n + '');
  }
  function today() {
    try {
      return new Intl.DateTimeFormat(C.lang === 'es' ? 'es' : 'en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function dateParts() {
    var locale = C.lang === 'es' ? 'es' : 'en';
    var d = new Date();
    try {
      return {
        day: new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(d),
        monthName: new Intl.DateTimeFormat(locale, { month: 'long' }).format(d),
        year: new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(d)
      };
    } catch (e) {
      return { day: d.getDate(), monthName: d.getMonth() + 1, year: d.getFullYear() };
    }
  }

  function loadProfile() {
    try {
      var raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return {};
  }
  function saveProfile(p) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p || {})); } catch (e) {}
  }
  function profileComplete(p) {
    p = p || {};
    return !!(String(p.fullName || '').trim() && String(p.whatsapp || '').trim() && String(p.country || '').trim() && String(p.email || '').trim());
  }

  function fieldDefs() {
    return [
      { name: 'fullName', label: C.labels.fullName, type: 'text', required: true, ac: 'name' },
      { name: 'company', label: C.labels.company, type: 'text', required: false, ac: 'organization' },
      { name: 'idNumber', label: C.labels.idNumber, type: 'text', required: false, ac: 'off' },
      { name: 'country', label: C.labels.country, type: 'text', required: true, ac: 'country-name' },
      { name: 'address', label: C.labels.address, type: 'text', required: false, ac: 'street-address' },
      { name: 'whatsapp', label: C.labels.whatsapp, type: 'tel', required: true, ac: 'tel' },
      { name: 'email', label: C.labels.email, type: 'email', required: true, ac: 'email' }
    ];
  }

  function validate(p) {
    p = p || {};
    var errs = {};
    fieldDefs().forEach(function (f) {
      if (f.required && !String(p[f.name] || '').trim()) errs[f.name] = C.labels.errRequired;
    });
    var email = String(p.email || '').trim();
    if (!errs.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = C.labels.errEmail;
    var phone = String(p.whatsapp || '').replace(/[^0-9]/g, '');
    if (!errs.whatsapp && phone && phone.length < 7) errs.whatsapp = C.labels.errPhone;
    return errs;
  }

  function fill(tpl, ctx) {
    return String(tpl).replace(/\{\{(\w+)\}\}/g, function (m, k) {
      return (ctx[k] == null) ? m : esc(ctx[k]);
    });
  }

  function tokenName(tpl) {
    var m = String(tpl).match(/\{\{(\w+)\}\}/);
    return m ? m[1] : null;
  }
  function partyRows(fields, ctx) {
    var out = '';
    (fields || []).forEach(function (row) {
      var name = tokenName(row[1]);
      var raw = (name && ctx[name] != null) ? String(ctx[name]).trim() : '';
      var val;
      if (!raw) {
        if (REQUIRED_CLIENT[name]) val = BLANK; else return;
      } else if (/^https?:\/\//i.test(raw)) {
        val = '<a href="' + esc(raw) + '" target="_blank" rel="noopener">' + esc(raw) + '</a>';
      } else {
        val = esc(raw);
      }
      out += '<p class="contract-party-row"><span class="cp-label">' + esc(row[0]) + ':</span> ' + val + '</p>';
    });
    return out;
  }

  /* Inner HTML of a .contract-doc for one service. */
  function buildContractHTML(id, months, profile) {
    var s = serviceById(id);
    if (!s) return '';
    var CL = C.clauses;
    var dp = dateParts();
    profile = profile || {};
    var ctx = {
      provider: C.provider.name,
      providerId: C.provider.id,
      providerDomicile: C.provider.domicile,
      site: C.provider.site,
      providerEmail: C.provider.email,
      providerWhatsapp: C.provider.whatsapp,
      providerTelegram: C.provider.telegram,
      fullName: profile.fullName,
      company: profile.company,
      idNumber: profile.idNumber,
      country: profile.country,
      address: profile.address,
      email: profile.email,
      whatsapp: profile.whatsapp,
      service: s.category,
      price: priceStr(id),
      duration: durationLabel(months),
      date: today(),
      day: dp.day,
      monthName: dp.monthName,
      year: dp.year
    };

    var out = '<h1 class="contract-doc-title">' + fill(CL.title, ctx) + '</h1>';
    if (CL.subtitle) out += '<p class="contract-doc-subtitle">' + fill(CL.subtitle, ctx) + '</p>';
    out += '<p class="contract-parties">' + fill(CL.intro, ctx) + '</p>';

    out += '<section class="contract-section contract-party"><h3>' + esc(CL.providerTitle) + '</h3>' +
      partyRows(CL.providerFields, ctx) +
      '<p class="contract-party-note">' + fill(CL.providerConstitutes, ctx) + '</p></section>';

    out += '<section class="contract-section contract-party"><h3>' + esc(CL.clientTitle) + '</h3>' +
      partyRows(CL.clientFields, ctx) +
      '<p class="contract-party-note">' + fill(CL.clientConstitutes, ctx) + '</p></section>';

    for (var i = 0; i < CL.sections.length; i++) {
      var sec = CL.sections[i];
      out += '<section class="contract-section">';
      if (sec.h) out += '<h3>' + esc(sec.h) + '</h3>';
      if (sec.p) out += '<p>' + fill(sec.p, ctx) + '</p>';
      if (sec.price) {
        var pnote = C.services && C.services[id] ? C.services[id].priceNote : '';
        if (pnote) out += '<p>' + esc(pnote) + '</p>';
      }
      if (sec.scope && s.includes && s.includes.length) {
        out += '<ul class="contract-scope">';
        for (var j = 0; j < s.includes.length; j++) out += '<li>' + esc(s.includes[j]) + '</li>';
        out += '</ul>';
        var note = C.services && C.services[id] ? C.services[id].note : '';
        if (note) out += '<p class="contract-scope-note">' + esc(note) + '</p>';
      }
      if (sec.outro) out += '<p>' + fill(sec.outro, ctx) + '</p>';
      out += '</section>';
    }

    out += '<p class="contract-close">' + fill(CL.close, ctx) + '</p>';
    out += '<div class="contract-signs">' +
      '<div class="contract-sign"><span class="cs-line"></span><span class="cs-name">' + esc(CL.providerSign) + '</span><span class="cs-sub">' + esc(C.provider.name) + '</span>' + (C.provider.id ? '<span class="cs-id">' + esc(C.provider.id) + '</span>' : '') + '</div>' +
      '<div class="contract-sign"><span class="cs-line"></span><span class="cs-name">' + esc(CL.clientSign) + '</span><span class="cs-sub">' + (esc(profile.fullName) || BLANK) + '</span>' + (profile.idNumber ? '<span class="cs-id">' + esc(profile.idNumber) + '</span>' : '') + '</div>' +
      '</div>';
    if (CL.disclaimer) out += '<p class="contract-disclaimer">' + esc(CL.disclaimer) + '</p>';
    return out;
  }

  /* Cart lines (localStorage) filtered to real services with valid months. */
  function cartEntries() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem('jh-hire-cart-v1') || '[]'); } catch (e) { return []; }
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (l) {
      return l && serviceById(l.id) && monthsList().indexOf(Number(l.months)) !== -1;
    }).map(function (l) { return { id: l.id, months: Number(l.months) }; });
  }

  function fieldsHTML(profile) {
    var out = '';
    fieldDefs().forEach(function (f) {
      out += '<div class="contract-field">' +
        '<label for="cf-' + f.name + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>' +
        '<input id="cf-' + f.name + '" name="' + f.name + '" type="' + f.type + '" value="' + esc(profile[f.name] || '') + '"' +
          (f.ac && f.ac !== 'off' ? ' autocomplete="' + f.ac + '"' : '') + (f.required ? ' required' : '') + ' />' +
        '<span class="err" data-err="' + f.name + '" role="alert"></span>' +
      '</div>';
    });
    return out;
  }
  function setErrors(form, errs) {
    fieldDefs().forEach(function (f) {
      var el = form.querySelector('[data-err="' + f.name + '"]');
      var input = form.querySelector('[name="' + f.name + '"]');
      if (el) el.textContent = errs[f.name] || '';
      if (input) { if (errs[f.name]) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    });
    var first = fieldDefs().filter(function (f) { return errs[f.name]; })[0];
    if (first) { var i = form.querySelector('[name="' + first.name + '"]'); if (i) i.focus(); }
    return !first;
  }
  function bindProfile(form, profile, onChange) {
    function handler(e) {
      var t = e.target;
      if (!t || !t.name) return;
      profile[t.name] = t.value;
      saveProfile(profile);
      var el = form.querySelector('[data-err="' + t.name + '"]');
      if (el) el.textContent = '';
      t.removeAttribute('aria-invalid');
      if (onChange) onChange();
    }
    form.addEventListener('input', handler);
    form.addEventListener('change', handler);
  }

  window.JH_CC = {
    isEs: C.lang === 'es',
    lang: C.lang,
    BLANK: BLANK,
    profileKey: PROFILE_KEY,
    esc: esc,
    serviceById: serviceById,
    monthsList: monthsList,
    priceStr: priceStr,
    durationLabel: durationLabel,
    today: today,
    loadProfile: loadProfile,
    saveProfile: saveProfile,
    profileComplete: profileComplete,
    fieldDefs: fieldDefs,
    validate: validate,
    fieldsHTML: fieldsHTML,
    setErrors: setErrors,
    bindProfile: bindProfile,
    buildContractHTML: buildContractHTML,
    cartEntries: cartEntries
  };
})();
