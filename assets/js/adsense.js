/*
 * assets/js/adsense.js — Módulo ÚNICO de Google AdSense (artículos del blog EN + ES).
 *
 * ── UN SOLO CÓDIGO (edita solo este string) ──────────────────────────────────
 * El código de AdSense vive aquí abajo, en la constante `adsense`, como texto.
 * El módulo lo inserta en cada artículo. Para cambiar a otra unidad (display,
 * in-article, etc.) basta con reemplazar el contenido del string.
 *
 * ── QUÉ HACE ─────────────────────────────────────────────────────────────────
 * Se auto-inicializa en cualquier página con un artículo de blog
 * (`.article-main` + `.article-footer`). Inserta un hueco que reserva altura
 * desde el primer momento (CSS `.article-ad { min-height }`) para evitar el
 * salto de layout (CLS) y, de forma lazy, rellena el código cuando el hueco está
 * a punto de entrar en el viewport (IntersectionObserver) para cuidar el LCP.
 * El código va envuelto en comentarios para localizar su inicio y fin:
 *   <!-- adsense:unit:start --> … <!-- adsense:unit:end -->
 *
 * ── USO ──────────────────────────────────────────────────────────────────────
 * En cada artículo del blog (lo añade tools/apply-adsense-tag.mjs):
 *   <script type="module" src="…/assets/js/adsense.js"></script>
 */

export const adsense = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3441201236960010"
     crossorigin="anonymous"></script>
<!-- Display ad unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-3441201236960010"
     data-ad-slot="2441382306"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;

/* Dónde se inserta: 'after-lead' (tras el párrafo de entrada, por defecto) o
 * 'before-footer' (antes del footer del artículo). */
const ANCHOR = 'after-lead';

/* Convierte los <script> inertes (innerHTML no los ejecuta) en scripts vivos,
 * y evita recargar el loader si ya está en el <head>. */
function activateScripts(root) {
  root.querySelectorAll('script').forEach((old) => {
    const isLoader = old.src && old.src.includes('adsbygoogle.js');
    if (isLoader && document.querySelector('head script[src*="adsbygoogle.js"]')) {
      old.remove();
      return;
    }
    const live = document.createElement('script');
    for (const attr of old.attributes) live.setAttribute(attr.name, attr.value);
    live.textContent = old.textContent;
    old.replaceWith(live);
  });
}

/* Rellena el hueco con el código de AdSense (una sola vez). */
function fill(box, doc) {
  if (box.dataset.adsense === 'filled') return;
  box.dataset.adsense = 'filled';
  const template = doc.createElement('template');
  template.innerHTML = adsense;
  activateScripts(template.content);
  box.appendChild(template.content);
}

/* Rellena el hueco cuando está a punto de entrar en el viewport (menos trabajo
 * al cargar → mejor LCP) o de inmediato si no hay IntersectionObserver. */
function fillWhenVisible(box, doc) {
  if (typeof IntersectionObserver === 'undefined') {
    fill(box, doc);
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) { fill(box, doc); obs.disconnect(); break; }
    }
  }, { rootMargin: '300px 0px' });
  io.observe(box);
}

/**
 * Inserta la unidad de AdSense en el artículo actual.
 * @param {Document} [doc] Documento (por defecto el global).
 * @returns {boolean} true si la página era un artículo y se montó.
 */
export function mountAdsense(doc = document) {
  const main = doc.querySelector('.article-main');
  const footer = doc.querySelector('.article-footer');
  if (!main || !footer) return false;

  const anchor = ANCHOR === 'before-footer'
    ? footer
    : (doc.querySelector('.article-lead') || main.firstElementChild);
  if (!anchor) return false;

  // El hueco se inserta vacío de inmediato: reserva su altura (CSS) y evita CLS.
  const box = doc.createElement('div');
  box.className = 'article-ad';

  const begin = doc.createComment(' adsense:unit:start ');
  const end = doc.createComment(' adsense:unit:end ');

  const parent = anchor.parentNode;
  const ref = ANCHOR === 'before-footer' ? anchor : anchor.nextSibling;
  parent.insertBefore(begin, ref);
  parent.insertBefore(box, ref);
  parent.insertBefore(end, ref);

  fillWhenVisible(box, doc);
  return true;
}

if (typeof document !== 'undefined') {
  const boot = () => mountAdsense();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}
