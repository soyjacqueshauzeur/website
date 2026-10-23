/* Home clients marquee — renders the complete client list
   (assets/js/clients-data.js → window.JH_CLIENTS) as infinite rows.
   Pace: one client every 2 s, so a full loop lasts n × 2 s.

   The home stacks two identical rows with no gap:
   - top:    scrolls right→left (content enters from the right), starts at
             client #7 of the list;
   - bottom: scrolls left→right with the list reversed, starts at the 7th from
             the end (#42). Rotating each row by 7 keeps them out of phase, so
             they never restart on the same logo at the same instant.
   `data-start` is 1-based and counts inside the row's own sequence: for the
   reversed row, position 7 means "7th from the end".

   The six static compact cards inside the first row stay as the no-JS
   fallback, and are left untouched when the user prefers reduced motion. The
   second row is decorative (aria-hidden) and only exists when there is motion. */
(function () {
  'use strict';

  var CLIENT_MS = 2500; // 2 s por cliente

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

  /* Secuencia de la fila: arranca en `start` (1-based) dentro de su propia
     lista —directa o invertida— y la recorre en ciclo, así el loop no tiene
     salto al repetirse. */
  function sequence(list, start, reverse) {
    var base = reverse ? list.slice().reverse() : list;
    var n = base.length;
    var from = (((start - 1) % n) + n) % n;
    var out = [];
    for (var i = 0; i < n; i++) out.push(base[(from + i) % n]);
    return out;
  }

  function build(wrap, list) {
    var mode = wrap.getAttribute('data-clients-marquee') || '';
    var reverse = mode.indexOf('reverse') >= 0;
    var decorative = wrap.hasAttribute('data-decorative');
    var start = parseInt(wrap.getAttribute('data-start'), 10) || 1;
    var items = sequence(list, start, reverse);
    var prefix = assetPrefix();

    var track = document.createElement('div');
    track.className = 'clients-marquee-track';

    for (var g = 0; g < 2; g++) {
      /* Dos grupos idénticos: al desplazar -50% el segundo toma el relevo del
         primero sin salto. El clon va oculto a lectores de pantalla. */
      var group = document.createElement('div');
      group.className = 'clients-marquee-group';
      if (g === 1) group.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < items.length; i++) {
        group.appendChild(card(items[i], prefix, g === 0, g === 1 || decorative));
      }
      track.appendChild(group);
    }

    wrap.innerHTML = '';
    wrap.removeAttribute('hidden');
    if (decorative) wrap.setAttribute('aria-hidden', 'true');
    wrap.appendChild(track);
    wrap.classList.add('is-active');
    wrap.style.setProperty('--clients-marquee-dur', (items.length * CLIENT_MS) / 1000 + 's');
  }

  ready(function () {
    var wraps = document.querySelectorAll('[data-clients-marquee]');
    var list = window.JH_CLIENTS;
    if (!wraps.length || !list || !list.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce && reduce.matches) return; // se queda la grilla estática

    for (var i = 0; i < wraps.length; i++) build(wraps[i], list);

    /* Las filas van en sentidos opuestos: la pausa (hover o foco) se aplica a
       todas a la vez, no solo a la que estás tocando. */
    function setPaused(state) {
      for (var j = 0; j < wraps.length; j++) wraps[j].classList.toggle('is-paused', state);
    }
    for (var k = 0; k < wraps.length; k++) {
      wraps[k].addEventListener('mouseenter', function () { setPaused(true); });
      wraps[k].addEventListener('mouseleave', function () { setPaused(false); });
      wraps[k].addEventListener('focusin', function () { setPaused(true); });
      wraps[k].addEventListener('focusout', function () { setPaused(false); });
    }
  });
})();
