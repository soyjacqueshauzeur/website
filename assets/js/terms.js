/* Términos ES — marca palabras con anglicismo y les añade un <dfn title="…">
   con su definición (tooltip nativo, legible por lectores de pantalla).
   Solo actúa en páginas con <html lang="es…">. Se carga al final, después de
   los renderers, y observa el DOM para cubrir contenido que se pinta tarde
   (carrito, cards, FX). Fuente única de las definiciones. */
(function () {
  'use strict';

  var lang = (document.documentElement.getAttribute('lang') || '');
  if (lang.toLowerCase().indexOf('es') !== 0) return;

  var DEFS = {
    'stack': 'El conjunto de herramientas y software que ya usas en tu negocio.',
    'hire': 'Contratación mensual de un servicio, pausable o cancelable cuando quieras.',
    'e-commerce': 'Comercio electrónico: tu tienda en línea.'
  };
  var TEST = /\b(stack|hire|e-commerce)\b/i;
  var RX = /\b(stack|hire|e-commerce)\b/gi;
  var SKIP = { DFN: 1, SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, CODE: 1, PRE: 1 };

  function wrapText(node) {
    var text = node.nodeValue;
    RX.lastIndex = 0;
    var parts = text.split(RX);
    if (parts.length < 2) return;
    var frag = document.createDocumentFragment();
    RX.lastIndex = 0;
    var last = 0;
    var m;
    while ((m = RX.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var dfn = document.createElement('dfn');
      var def = DEFS[m[0].toLowerCase()];
      dfn.title = def;
      dfn.setAttribute('data-def', def);
      dfn.textContent = m[0];
      frag.appendChild(dfn);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }

  function walk(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!p || SKIP[p.nodeName] || !n.nodeValue || !TEST.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('dfn')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (var i = 0; i < nodes.length; i++) wrapText(nodes[i]);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var t = null;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(function () { walk(document.body); }, 80);
  }

  ready(function () {
    walk(document.body);
    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  });
})();
