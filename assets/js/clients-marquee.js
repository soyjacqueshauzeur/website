/* Home clients marquee — renders the complete client list
   (assets/js/clients-data.js → window.JH_CLIENTS) as an infinite right-to-left
   loop. Speed: one client every 1.5 s, so the loop lasts n × 1.5 s.

   The six static compact cards already in the HTML stay as the no-JS fallback,
   and are left untouched when the user prefers reduced motion. */
(function () {
  'use strict';

  var CLIENT_MS = 1500; // 1.5 s por cliente

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* Prefijo de assets calculado desde el propio <script>: '' en la raíz,
     '../' en /es/, y cualquier profundidad de despliegue. */
  function assetPrefix() {
    var s = document.querySelector('script[src*="clients-marquee.js"]');
    var src = s ? s.getAttribute('src') : 'assets/js/clients-marquee.js';
    var i = src.indexOf('assets/js/');
    return i >= 0 ? src.slice(0, i) : '';
  }

  function card(client, prefix, eager, cloned) {
    var el = document.createElement('a');
    el.className = 'client-card';
    el.href = 'clients.html'; // misma ruta relativa: /clients.html o /es/clients.html
    if (cloned) el.setAttribute('tabindex', '-1');

    var img = document.createElement('img');
    img.className = 'client-logo';
    img.src = prefix + client.logo;
    img.alt = ''; // decorativo: el nombre va como texto del enlace
    img.width = 96;
    img.height = 96;
    img.loading = eager ? 'eager' : 'lazy';
    img.decoding = 'async';

    var name = document.createElement('span');
    name.className = 'client-name';
    name.textContent = client.name;

    el.appendChild(img);
    el.appendChild(name);
    return el;
  }

  function build(wrap, list) {
    var prefix = assetPrefix();
    var track = document.createElement('div');
    track.className = 'clients-marquee-track';

    for (var g = 0; g < 2; g++) {
      /* Dos grupos idénticos: al desplazar -50% el segundo toma el relevo del
         primero sin salto. El clon va oculto a lectores de pantalla. */
      var group = document.createElement('div');
      group.className = 'clients-marquee-group';
      if (g === 1) group.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < list.length; i++) {
        group.appendChild(card(list[i], prefix, g === 0, g === 1));
      }
      track.appendChild(group);
    }

    wrap.innerHTML = '';
    wrap.appendChild(track);
    wrap.classList.add('is-active');
    wrap.style.setProperty('--clients-marquee-dur', (list.length * CLIENT_MS) / 1000 + 's');
  }

  ready(function () {
    var wraps = document.querySelectorAll('[data-clients-marquee]');
    var list = window.JH_CLIENTS;
    if (!wraps.length || !list || !list.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce && reduce.matches) return; // se queda la grilla estática

    for (var i = 0; i < wraps.length; i++) build(wraps[i], list);
  });
})();
