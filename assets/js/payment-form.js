/* Formulario previo al pago con MercadoPago.
 *
 * Recoge nombre, correo, WhatsApp y consentimiento de datos — el backend los
 * exige para crear la preferencia. Reutiliza el perfil del contrato
 * (`jh-contract-profile`) si ya existe y lo actualiza al confirmar.
 *
 *   JH_PAYMENT_FORM.open({ lang: 'es'|'en', summary: 'USD $597 total' })
 *     .then(function (data) {
 *       data.customer // { name, email, phone }
 *       data.consent  // { data: true, terms: true, at: ISO }
 *     })
 *     .catch(function () { ... cancelado ... });
 */
(function () {
  'use strict';

  var PROFILE_KEY = 'jh-contract-profile';

  var T = {
    es: {
      title: 'Datos para el pago',
      sub: 'MercadoPago te pedirá la tarjeta en el siguiente paso. Aquí solo guardo a nombre de quién va el pago.',
      name: 'Nombre completo',
      namePh: 'Tu nombre completo',
      email: 'Correo electrónico',
      emailPh: 'tu@correo.com',
      phone: 'WhatsApp con indicativo',
      phonePh: '+57 300 000 0000',
      consent: 'Autorizo el tratamiento de mis datos personales para gestionar este pago y el servicio contratado.',
      pay: 'Continuar al pago',
      cancel: 'Cancelar',
      errName: 'Escribe tu nombre.',
      errEmail: 'Escribe un correo válido.',
      errPhone: 'Escribe un WhatsApp válido (mínimo 7 dígitos).',
      errConsent: 'Debes autorizar el tratamiento de datos.'
    },
    en: {
      title: 'Payment details',
      sub: 'MercadoPago will ask for your card in the next step. Here I only record who the payment belongs to.',
      name: 'Full name',
      namePh: 'Your full name',
      email: 'Email',
      emailPh: 'you@email.com',
      phone: 'WhatsApp with country code',
      phonePh: '+57 300 000 0000',
      consent: 'I authorise the processing of my personal data to manage this payment and the service hired.',
      pay: 'Continue to payment',
      cancel: 'Cancel',
      errName: 'Please enter your name.',
      errEmail: 'Please enter a valid email.',
      errPhone: 'Please enter a valid WhatsApp number (at least 7 digits).',
      errConsent: 'You must authorise data processing.'
    }
  };

  function loadProfile() {
    try {
      var raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (raw && typeof raw === 'object') return raw;
    } catch (e) {}
    return {};
  }

  function saveProfile(patch) {
    var p = loadProfile();
    Object.keys(patch).forEach(function (k) { p[k] = patch[k]; });
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); }

  function field(id, label, type, autocomplete, placeholder) {
    return (
      '<label class="jhpf-field" for="' + id + '">' +
        '<span class="jhpf-label">' + label + '</span>' +
        '<input id="' + id + '" class="jhpf-input" type="' + type + '" autocomplete="' + autocomplete + '" placeholder="' + placeholder + '" />' +
        '<span class="jhpf-error" data-error-for="' + id + '" role="alert" hidden></span>' +
      '</label>'
    );
  }

  function open(opts) {
    opts = opts || {};
    var lang = String(opts.lang || document.documentElement.lang || 'en').toLowerCase().slice(0, 2) === 'es' ? 'es' : 'en';
    var t = T[lang];
    var profile = loadProfile();
    var previousFocus = document.activeElement;

    return new Promise(function (resolve, reject) {
      var overlay = document.createElement('div');
      overlay.className = 'jhpf-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'jhpf-title');

      overlay.innerHTML =
        '<div class="jhpf-card">' +
          '<button type="button" class="jhpf-close" aria-label="' + (lang === 'es' ? 'Cerrar' : 'Close') + '">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
          '<h2 class="jhpf-title" id="jhpf-title">' + t.title + '</h2>' +
          '<p class="jhpf-sub">' + t.sub + '</p>' +
          (opts.summary ? '<p class="jhpf-summary">' + opts.summary + '</p>' : '') +
          '<form class="jhpf-form" novalidate>' +
            field('jhpf-name', t.name, 'text', 'name', t.namePh) +
            field('jhpf-email', t.email, 'email', 'email', t.emailPh) +
            field('jhpf-phone', t.phone, 'tel', 'tel', t.phonePh) +
            '<label class="jhpf-consent">' +
              '<input id="jhpf-consent" type="checkbox" />' +
              '<span>' + t.consent + '</span>' +
            '</label>' +
            '<span class="jhpf-error" data-error-for="jhpf-consent" role="alert" hidden></span>' +
            '<button type="submit" class="jhpf-pay">' + t.pay + '</button>' +
            '<button type="button" class="jhpf-cancel">' + t.cancel + '</button>' +
          '</form>' +
        '</div>';

      var nameEl = overlay.querySelector('#jhpf-name');
      var emailEl = overlay.querySelector('#jhpf-email');
      var phoneEl = overlay.querySelector('#jhpf-phone');
      var consentEl = overlay.querySelector('#jhpf-consent');
      var form = overlay.querySelector('form');

      nameEl.value = profile.fullName || '';
      emailEl.value = profile.email || '';
      phoneEl.value = profile.whatsapp || '';

      function close() {
        document.removeEventListener('keydown', onKey, true);
        document.body.style.overflow = '';
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (previousFocus && previousFocus.focus) { try { previousFocus.focus(); } catch (e) {} }
      }

      function cancel() {
        close();
        var err = new Error('cancelled');
        err.cancelled = true;
        reject(err);
      }

      function showError(id, message) {
        var box = overlay.querySelector('[data-error-for="' + id + '"]');
        var input = overlay.querySelector('#' + id);
        if (box) { box.textContent = message; box.hidden = !message; }
        if (input) {
          if (message) input.setAttribute('aria-invalid', 'true');
          else input.removeAttribute('aria-invalid');
        }
      }

      function clearErrors() {
        ['jhpf-name', 'jhpf-email', 'jhpf-phone', 'jhpf-consent'].forEach(function (id) { showError(id, ''); });
      }

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); cancel(); return; }
        if (e.key !== 'Tab') return;
        var focusables = overlay.querySelectorAll('button, input, [href], select, textarea');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) cancel();
      });
      overlay.querySelector('.jhpf-close').addEventListener('click', cancel);
      overlay.querySelector('.jhpf-cancel').addEventListener('click', cancel);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        var name = String(nameEl.value || '').trim();
        var email = String(emailEl.value || '').trim().toLowerCase();
        var phone = String(phoneEl.value || '').trim();
        var ok = true;

        if (!name) { showError('jhpf-name', t.errName); ok = false; }
        if (!validEmail(email)) { showError('jhpf-email', t.errEmail); ok = false; }
        if (digits(phone).length < 7) { showError('jhpf-phone', t.errPhone); ok = false; }
        if (!consentEl.checked) { showError('jhpf-consent', t.errConsent); ok = false; }

        if (!ok) {
          var first = overlay.querySelector('[aria-invalid="true"]');
          if (first) first.focus();
          return;
        }

        saveProfile({ fullName: name, email: email, whatsapp: phone });
        close();
        resolve({
          customer: { name: name, email: email, phone: phone },
          consent: { data: true, terms: true, at: new Date().toISOString() }
        });
      });

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKey, true);
      nameEl.focus();
    });
  }

  /* Estilos propios: siguen los tokens del sitio (tema oscuro y claro). */
  if (!document.getElementById('jhpf-styles')) {
    var style = document.createElement('style');
    style.id = 'jhpf-styles';
    style.textContent = [
      '.jhpf-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(5,5,7,.74);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);overflow-y:auto}',
      '.jhpf-card{position:relative;width:100%;max-width:460px;margin:auto;background:var(--ink-card,#18181C);color:var(--paper,#F4F4F0);border:1px solid var(--ink-line,rgba(244,244,240,.08));border-radius:var(--radius-lg,20px);padding:26px 24px 22px;box-shadow:0 30px 80px -30px rgba(0,0,0,.7);font-family:var(--font-body,system-ui,sans-serif)}',
      '.jhpf-close{position:absolute;top:14px;right:14px;width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ink-line,rgba(244,244,240,.12));border-radius:50%;background:transparent;color:var(--paper-soft,#C9C9C2);cursor:pointer}',
      '.jhpf-close:hover{color:var(--paper,#F4F4F0);border-color:var(--paper-mute,#9A9A94)}',
      '.jhpf-title{margin:0 0 8px;font-family:var(--font-display,system-ui,sans-serif);font-size:1.45rem;line-height:1.1;letter-spacing:-.01em;color:var(--paper,#F4F4F0);padding-right:40px}',
      '.jhpf-sub{margin:0 0 12px;font-size:.88rem;line-height:1.5;color:var(--paper-soft,#C9C9C2)}',
      '.jhpf-summary{margin:0 0 18px;font-family:var(--font-mono,ui-monospace,monospace);font-size:.82rem;color:var(--lime,#D4FF3D);border:1px solid var(--ink-line,rgba(244,244,240,.12));border-radius:var(--radius-full,999px);padding:6px 12px;display:inline-block}',
      '.jhpf-form{display:flex;flex-direction:column;gap:13px}',
      '.jhpf-field{display:flex;flex-direction:column;gap:6px}',
      '.jhpf-label{font-family:var(--font-mono,ui-monospace,monospace);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;color:var(--paper-mute,#9A9A94)}',
      '.jhpf-input{width:100%;background:var(--ink-elev,#232328);color:var(--paper,#F4F4F0);border:1px solid var(--ink-line,rgba(244,244,240,.12));border-radius:var(--radius,12px);padding:12px 14px;font:inherit;font-size:.95rem}',
      '.jhpf-input:focus{outline:2px solid var(--lime,#D4FF3D);outline-offset:1px;border-color:transparent}',
      '.jhpf-input[aria-invalid="true"]{border-color:#FF6B6B}',
      '.jhpf-input::placeholder{color:var(--paper-mute,#9A9A94);opacity:1}',
      '.jhpf-error{font-size:.78rem;color:#FF8A8A}',
      'html[data-theme="light"] .jhpf-error{color:#B42318}',
      'html[data-theme="light"] .jhpf-input[aria-invalid="true"]{border-color:#B42318}',
      '.jhpf-consent{display:flex;gap:10px;align-items:flex-start;font-size:.82rem;line-height:1.45;color:var(--paper-soft,#C9C9C2);cursor:pointer}',
      '.jhpf-consent input{margin-top:3px;width:16px;height:16px;accent-color:var(--lime,#D4FF3D);flex:0 0 auto}',
      '.jhpf-pay{margin-top:4px;border:0;border-radius:var(--radius-full,999px);background:var(--lime,#D4FF3D);color:#0A0A0C;font:inherit;font-weight:700;font-size:.98rem;padding:13px 18px;cursor:pointer}',
      '.jhpf-pay:hover{background:var(--lime-deep,#9CCB1F)}',
      '.jhpf-pay:disabled{opacity:.6;cursor:wait}',
      '.jhpf-cancel{border:0;background:transparent;color:var(--paper-mute,#9A9A94);font:inherit;font-size:.85rem;padding:4px;cursor:pointer}',
      '.jhpf-cancel:hover{color:var(--paper,#F4F4F0)}'
    ].join('\n');
    document.head.appendChild(style);
  }

  window.JH_PAYMENT_FORM = { open: open };
})();
