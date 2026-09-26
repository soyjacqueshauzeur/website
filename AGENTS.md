# AGENTS.md — Sitio bilingüe EN/ES

Reglas para este repositorio (web estática de Jacques Hauzeur):

## i18n: cada cambio se aplica a TODOS los idiomas
- EN vive en la raíz: `index.html`, `blog.html`, `services.html`, `clients.html`, `sessions.html`, `contact.html`.
- ES vive en `/es/` con los mismos nombres: `es/index.html`, etc.
- RU vivirá en `/ru/` con los mismos nombres: `ru/index.html`, etc. (aún no creado).
- **Cualquier cambio de estructura, imagen, botón o sección** debe reflejarse en la versión EN y en las demás (los textos van traducidos; la estructura/imágenes deben coincidir).
- **Recursos compartidos**: usa el mismo nombre de archivo desde cada idioma. En `/es/` y `/ru/` los paths llevan `../assets/…`; en la raíz `assets/…`.

## Verificación obligatoria tras editar
Ejecutar siempre:
```
node tools/i18n-sync-check.mjs
```
Debe terminar en `PASS`. Si da `FAIL`, corregir la diferencia (imagen o sección que falta en un idioma) antes de dar por terminado.

## Datos (blog, etc.)
- Posts EN: `assets/js/blog-data.js` · Posts ES: `assets/js/blog-data-es.js`.
- Ambos se actualizan juntos (mismos slugs; contenido traducido). `blog.js` / `blog-es.js` / `journal-latest.js` ya leen esos archivos.

## Navegación y páginas generadas
La barra de nav canónica es: `Home · Clients · 1:1 · Services · About me · Blog` (ES: `Inicio · Clientes · 1:1 · Servicios · Sobre mí · Blog`). "1:1" apunta a `sessions.html` (EN) / `sesiones.html` (ES). "About me / Sobre mí" apunta a `index.html#about` (sección `id="about"` en la home). El CTA del header es `Book a call` / `Reservar una llamada`, y el lang-switch es US/CO/RU.
- **Fuente única de nav/footer EN y ES: `tools/site-shell.mjs`** (header + mobile drawer + footer). NUNCA editar el header/footer a mano en un HTML: se regenera.
- Páginas estáticas top-level (EN y ES): las pinta `tools/apply-nav.mjs` consumiendo `site-shell.mjs`.
- Hub de servicios + 6 páginas de servicio (EN/ES): se generan desde `assets/js/hire-data*.js` + `tools/build-hire-pages.mjs`, que también consume `site-shell.mjs`.
- `es/sesiones.html` / `sessions.html` son la página Sessions/Sesiones con el widget de clases (`assets/js/class-booking.js`, bilingüe vía `JH_HIRE.lang`; carga `hire-data-es.js` en ES y `hire-data.js` en EN). Los archivos usan distinto nombre por idioma (`sessions.html` EN vs `sesiones.html` ES), mapeados en `ALT_PAGE` dentro de `site-shell.mjs`.
- Páginas demo sueltas que aún NO llevan el shell del sitio (se revisan aparte): `blog.html` (EN), `gallery.html`.
- Tras cambiar el nav (orden/labels/href/CTA/flags) o los textos del hire, ejecutar siempre:
  ```
  node tools/apply-nav.mjs
  node tools/build-hire-pages.mjs
  node tools/i18n-sync-check.mjs
  ```
- Los datos del carrito (precios mensuales, monedas, meses, WhatsApp/Telegram) viven en `assets/js/hire-data.js` (EN) y `hire-data-es.js` (ES); el carrito es `assets/js/hire.js` y su CSS está en `styles.css` (bloque "Monthly hire").

## Monedas FX (precios USD + moneda local ≈)
- `assets/js/fx.js` (compartido EN/ES, se carga ANTES de hire.js / class-booking.js): tasas de Frankfurter sin API key (`https://api.frankfurter.dev/v2/rates?base=USD&quotes=…`), caché en `localStorage['jh-fx']` por 24 h, moneda secundaria por defecto `COP` en `localStorage['jh-fx-sel']`.
- Los precios canónicos SIEMPRE están en USD. Cada precio renderizado puede llevar un `<span class="price-approx" data-approx="<usd>">` que fx rellena con `≈ <local>`. Selector de moneda = cualquier elemento `[data-fx-anchor]` (etiquetas nativas de moneda).
- Quote estructurado para futuras pasarelas en `localStorage['jh-pay-quote']` (moneda, items en USD + local, totales) — se escribe al cambiar carrito/horas/moneda. La llamada a PayPal/MercadoPago es una etapa futura; aquí solo se persiste.
- `hire.js` y `class-booking.js` exponen helpers `AX(n)` (span approx) / `renderFX()` / `renderNodeFX(id, usd)` y escuchan `jh:fxchange`. En FX no hay textos por idioma: los nombres de moneda son nativos y el label del picker usa `<html lang>`.

