/* Home — show the 3 most recent blog posts in #journal-grid.
   Data source: window.BLOG_POSTS (EN) or window.BLOG_POSTS_ES (ES),
   defined by blog-data.js / blog-data-es.js.
   The blog list page is sorted the same way (newest first) in blog.js / blog-es.js. */
(function () {
  'use strict';

  var lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  var posts = lang === 'es' ? (window.BLOG_POSTS_ES || []) : (window.BLOG_POSTS || []);
  var grid = document.getElementById('journal-grid');
  if (!grid || !posts.length) return;

  var MONTHS_EN = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  var MONTHS_ES_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function parseDate(str) {
    var m = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(String(str).trim());
    if (!m) return new Date(0);
    var mon = MONTHS_EN[(m[2] || '').toLowerCase().slice(0, 3)];
    return new Date(Number(m[3]), isNaN(mon) ? 0 : mon, Number(m[1]));
  }

  function formatDate(d) {
    var day = d.getDate();
    if (lang === 'es') {
      var mes = MONTHS_ES_SHORT[d.getMonth()];
      return day + ' ' + mes.charAt(0).toUpperCase() + mes.slice(1) + ' ' + d.getFullYear();
    }
    var EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return String(day).padStart(2, '0') + ' ' + EN[d.getMonth()] + ' ' + d.getFullYear();
  }

  var CAT = lang === 'es'
    ? { setup: 'Configuración', process: 'Proceso', business: 'Negocio', archive: 'Archivo', philosophy: 'Filosofía', gear: 'Equipo' }
    : { setup: 'Setup', process: 'Process', business: 'Business', archive: 'Archive', philosophy: 'Philosophy', gear: 'Gear' };

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var recent = posts.slice().sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); }).slice(0, 3);

  grid.innerHTML = recent.map(function (a) {
    var when = formatDate(parseDate(a.date));
    var cat = CAT[a.category] || cap(a.category);
    var link = lang === 'es'
      ? '/es/2026/07/' + a.slug + '.html'
      : '/2026/07/' + a.slug + '.html';
    var label = lang === 'es' ? 'Leer nota' : 'Read note';
    return (
      '<article class="journal-card">' +
        '<div class="j-img"><img src="' + a.image + '" alt="' + a.title + '" loading="lazy" /></div>' +
        '<div class="j-meta"><span>' + cat + '</span><span aria-hidden="true">·</span><span>' + when + '</span></div>' +
        '<h3>' + a.title + '</h3>' +
        '<p>' + a.excerpt + '</p>' +
        '<a class="btn btn--ghost btn--sm" href="' + link + '">' + label + '</a>' +
      '</article>'
    );
  }).join('');
})();
