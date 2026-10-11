# Accessibility report (axe-core)

Auditoría de accesibilidad con **axe-core 4.10.2** sobre las páginas clave.
**Resultado actual: 0 violaciones** (violations) en todas las páginas probadas.

## Cómo se generó
- Servidor local: `python3 -m http.server 8095` (desde la raíz del repo).
- Navegador headless (Playwright) recorriendo las páginas y, tras cargar el CSS
  diferido, inyectando `axe-core` desde CDN y ejecutando `axe.run`.
- Páginas: `index.html`, `clients.html`, `services.html`, `sessions.html`,
  `blog.html`, `blog/2026/09/webs-2026.html`, `es/index.html`, `es/clients.html`,
  `es/sesiones.html`, `es/services.html`, y los carritos abiertos
  (`services.html` y `sessions.html`).
- Sin dependencias instaladas (axe se carga en el navegador desde CDN).

Reproducir manualmente:
```bash
python3 -m http.server 8095
# en la consola del navegador:
#   const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'; s.onload=()=>axe.run().then(r=>console.log(r.violations)); document.head.appendChild(s);
# o con la CLI:
npx @axe-core/cli http://localhost:8095/index.html
```
> Nota: si se ejecuta antes de que aplique el CSS diferido (`styles.min.css`),
> puede dar falsos positivos de contraste. Espera a que `media` deje de ser `print`.

## Corregido en esta pasada
| Regla axe | Antes | Arreglo |
|---|---|---|
| `aria-allowed-role` | `<aside class="hire-cart" role="dialog">` (hire.js, class-booking.js) | se crea como `<div role="dialog">` (elemento apropiado) |
| `link-name` | `clients.html`: `<a class="client-logo-link"><img alt=""></a>` (55) | `alt` = nombre del cliente |
| `heading-order` | footer `<h4>` y `clients.html` `h1→h3` | footer `<h2 class="footer-heading">`; `clients.html` `h3.client-name` → `h2.client-name` (estilo por clase) |
| `heading-order` | blog: `sidebar-card h4` tras `h2` | `h4` → `h3` (blog.css `.sidebar-card h3`) |
| `landmark-complementary-is-top-level` | blog `aside.article-sidebar` dentro de `main` | `<div class="article-sidebar">` |
| `image-redundant-alt` | bandera del idioma con `alt` + texto oculto | `alt=""` en la imagen (el texto oculto da el nombre) |
| `color-contrast` | grises terciarios sobre fondos oscuros/claros | `--paper-mute` `#80807A` → `#9A9A94`; `.client-id` usa `--fg-mute`; `.tile-section .pull-quote cite` usa `--fg-on-tile-mute` |

## Estado / pendientes
- **Lighthouse “Accessibility”** debería quedar en **100** en las páginas auditadas.
- Pendiente de auditar con axe (no incluido aún): páginas `*-hire.html`, `price-t.html`,
  `blog-t.html`, `gallery.html` (demos/`noindex`), y **tema claro** (`data-theme="light"`).
  Se puede extender este mismo procedimiento cuando se quiera.
- Recomendado a futuro: probar el carrito con teclado + lector de pantalla (foco,
  trampa de foco y retorno de foco) — mejora de UX, no la marca Lighthouse.
