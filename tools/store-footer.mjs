#!/usr/bin/env node
/*
 * store-footer.mjs — FUENTE ÚNICA del footer de la tienda (SoyJacquesHauzeur).
 *
 * Lo consumen tools/apply-store-footer.mjs (inyecta el footer en las páginas)
 * para que tienda + productos + futuras páginas compartan EXACTAMENTE el mismo
 * footer (mismo tamaño, distribución, textos y estilos).
 *
 * El footer es autocontenido (clases .sf-*) y SIEMPRE en oscuro, por lo que se
 * ve idéntico en cualquier página y con cualquier tema (claro/oscuro).
 *
 * Para cambiar el footer: edita este archivo y ejecuta
 *   node tools/apply-store-footer.mjs
 */

/* Producto principal de la tienda (destino de "Preguntas frecuentes", etc.).
   Al agregar productos, actualiza esta constante (o amplía lo que necesites). */
export const PRODUCT = 'synaptic-sleep-5-z/index.html';

/* Rutas de la tienda relativas a es/tienda/ (se les antepone `base`). */
export const STORE_LINKS = {
  tienda: 'tienda.html',
  envios: 'envios.html',
  devoluciones: 'devoluciones.html',
  privacidad: 'privacidad.html',
  cookies: 'cookies.html',
  terminos: 'terminos.html',
};

/* Copyright del footer (sin "Jacques Hauzeur"). */
export const COPY = '© <span class="sf-year">2026</span> <span class="sf-month">Octubre</span> <a class="sf-copy-link" href="/home/jacques/opencode/jacques/index.html">&lt;/&gt; SoyJacquesHauzeur</a>';

/* CSS autocontenido del footer (paleta oscura fija). */
export function storeFooterCSS() {
  return `<style>
  .sf{background:#050507;color:#F4F4F0;border-top:1px solid rgba(244,244,240,.08);padding:56px 0 40px;font-family:'Inter Tight',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
  .sf-inner{width:100%;max-width:1340px;margin-inline:auto;padding-inline:clamp(1.25rem,1rem + 1.5vw,2.25rem)}
  .sf-grid{display:grid;gap:34px;grid-template-columns:1fr}
  @media(min-width:760px){.sf-grid{grid-template-columns:1.6fr 1fr 1fr 1fr}}
  .sf-brand .sf-logo{display:inline-flex;align-items:center;gap:10px;font-family:'Boldonse',system-ui,sans-serif;font-size:1.25rem;text-transform:uppercase;color:#F4F4F0;text-decoration:none;letter-spacing:.01em}
  .sf-mark{width:28px;height:28px;border-radius:4px;background:#D4FF3D;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
  .sf-mark::after{content:"{}";font-family:'Geist Mono',ui-monospace,'SF Mono',Menlo,monospace;font-weight:600;font-size:16px;line-height:1;color:#0A0A0C}
  .sf-desc{margin:16px 0 0;max-width:40ch;color:#C9C9C2;font-size:.95rem;line-height:1.6}
  .sf-pay{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
  .sf-pay span{border:1px solid rgba(244,244,240,.16);border-radius:8px;padding:5px 10px;font-family:'Geist Mono',ui-monospace,monospace;font-size:.62rem;color:#80807A;letter-spacing:.06em}
  .sf-col h4{font-family:'Geist Mono',ui-monospace,monospace;font-size:.75rem;text-transform:uppercase;letter-spacing:.12em;color:#80807A;margin:0 0 14px;font-weight:400}
  .sf-col ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}
  .sf-col a{color:#C9C9C2;font-size:.95rem;text-decoration:none}
  .sf-col a:hover{color:#D4FF3D}
  .sf-bottom{margin-top:40px;padding-top:24px;border-top:1px solid rgba(244,244,240,.08);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:#80807A;font-size:.8125rem;font-family:'Geist Mono',ui-monospace,monospace;text-transform:uppercase;letter-spacing:.06em}
  .sf-meta{display:flex;gap:20px;flex-wrap:wrap}
  .sf-meta a{color:#80807A;text-decoration:none}
  .sf-meta a:hover{color:#D4FF3D}
  .sf-copy a{color:inherit;text-decoration:none}
  .sf-copy a:hover{color:#D4FF3D}
</style>`;
}

/* Markup del footer. `base` = prefijo relativo a es/tienda/ ('' o '../'). */
export function storeFooterHTML(base = '') {
  const L = STORE_LINKS;
  const p = base + PRODUCT;
  return `<footer class="sf">
  <div class="sf-inner">
    <div class="sf-grid">
      <div class="sf-brand">
        <a class="sf-logo" href="${base}${L.tienda}"><span class="sf-mark" aria-hidden="true"></span> SoyJacquesHauzeur</a>
        <p class="sf-desc">Miles de productos, precios bajos y envío rápido a todo el país.</p>
        <div class="sf-pay" aria-label="Medios de pago"><span>VISA</span><span>MASTERCARD</span><span>PSE</span><span>NEQUI</span><span>DAVIPLATA</span><span>NUBANK</span></div>
      </div>
      <div class="sf-col">
        <h4>Ayuda</h4>
        <ul>
          <li><a href="${base}${L.tienda}">Tienda</a></li>
          <li><a href="${p}#faq">Preguntas frecuentes</a></li>
          <li><a href="${base}${L.envios}">Envíos y entregas</a></li>
          <li><a href="${p}#pedido">Hacer un pedido</a></li>
          <li><a href="${p}#resenas">Reseñas</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <h4>Contacto</h4>
        <ul>
          <li><a href="https://wa.me/573507402009" target="_blank" rel="noopener">WhatsApp: +57 350 740 2009</a></li>
          <li><a href="mailto:hola@soyjacqueshauzeur.dev">hola@soyjacqueshauzeur.dev</a></li>
          <li><a href="#" rel="noopener">Instagram</a></li>
          <li><a href="#" rel="noopener">Facebook</a></li>
        </ul>
      </div>
      <div class="sf-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="${base}${L.privacidad}">Política de privacidad</a></li>
          <li><a href="${base}${L.devoluciones}">Política de devoluciones</a></li>
          <li><a href="${base}${L.envios}">Política de envíos</a></li>
          <li><a href="${base}${L.cookies}">Política de cookies</a></li>
          <li><a href="${base}${L.terminos}">Términos y condiciones</a></li>
        </ul>
      </div>
    </div>
    <div class="sf-bottom">
      <span class="sf-copy">${COPY}</span>
      <div class="sf-meta">
        <a href="${base}${L.envios}">Envíos</a>
        <a href="${base}${L.devoluciones}">Devoluciones</a>
        <a href="${base}${L.privacidad}">Privacidad</a>
      </div>
    </div>
  </div>
</footer>`;
}

/* Script del footer: rellena año y mes actuales (fecha dinámica). */
export function storeFooterScript() {
  return `<script>
  (function () {
    var d = new Date();
    var year = String(d.getFullYear());
    var month = '';
    try { month = new Intl.DateTimeFormat('es', { month: 'long' }).format(d); } catch (e) {}
    if (month) month = month.charAt(0).toUpperCase() + month.slice(1);
    var ys = document.querySelectorAll('.sf-year');
    for (var i = 0; i < ys.length; i++) ys[i].textContent = year;
    var ms = document.querySelectorAll('.sf-month');
    for (var j = 0; j < ms.length; j++) if (month) ms[j].textContent = month;
  })();
</script>`;
}

/* Bloque completo (CSS + markup + script) que se inyecta entre los marcadores. */
export function storeFooterBlock(base = '') {
  return storeFooterCSS() + '\n' + storeFooterHTML(base) + '\n' + storeFooterScript();
}
