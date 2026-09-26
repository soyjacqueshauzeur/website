/* Clients grid — renumbers the visible client cards sequentially so hidden
   cards (class "is-hidden") don't leave gaps in the numbering. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var cards = document.querySelectorAll('.client-card');
    var n = 0;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.classList.contains('is-hidden')) continue;
      if (window.getComputedStyle && getComputedStyle(card).display === 'none') continue;
      var id = card.querySelector('.client-id');
      if (!id) continue;
      n++;
      id.textContent = n < 10 ? '0' + n : String(n);
    }

    var pad = function (x) { return x < 10 ? '0' + x : String(x); };
    var range = document.querySelector('.client-range');
    if (range) {
      var parts = range.textContent.split('\u00b7');
      var suffix = parts.length > 1 ? parts.slice(1).join('\u00b7') : '';
      range.textContent = '01 \u2014 ' + pad(n) + ' \u00b7' + suffix;
    }
    var count = document.querySelector('.client-count');
    if (count) count.textContent = String(n);
  });
})();
