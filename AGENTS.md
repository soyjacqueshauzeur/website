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
node tools/seo-check.mjs
```
Ambos deben terminar en `PASS`. Si alguno da `FAIL`, corregir (imagen/sección que falta en un idioma, o canonical/robots/JSON-LD/hreflang/sitemap) antes de dar por terminado. Si tocaste el `<head>`, el nav, el hire o el blog, corre antes `apply-seo.mjs` y `build-sitemap.mjs` (ver secuencia completa abajo).

## Datos (blog, etc.)
- Posts EN: `assets/js/blog-data.js` · Posts ES: `assets/js/blog-data-es.js`.
- Ambos se actualizan juntos (mismos slugs; contenido traducido). `blog.js` / `blog-es.js` / `journal-latest.js` ya leen esos archivos.
- **Estructura del blog (Opción A = idioma → calendario)**: listado en `blog.html` (EN) / `es/blog.html` (ES); artículos en `blog/<año>/<mes>/<slug>.html` (EN) y `es/blog/<año>/<mes>/<slug>.html` (ES), mismo slug en ambos. Archivo mensual en `blog/<año>/<mes>/index.html` / `es/blog/<año>/<mes>/index.html`.
- La `url` en `blog-data*.js` es el mismo string relativo (`blog/<año>/<mes>/<slug>.html`) en EN y ES: desde `/es/` resuelve bajo `/es/blog/…`.
- Cada artículo lleva `canonical` + `hreflang` EN/ES/x-default + JSON-LD `BlogPosting` (los inyecta `tools/apply-seo.mjs`).

## Navegación y páginas generadas
La barra de nav canónica es: `Home · Clients · 1:1 · Services · About me · Blog` (ES: `Inicio · Clientes · 1:1 · Servicios · Sobre mí · Blog`). "1:1" apunta a `sessions.html` (EN) / `sesiones.html` (ES). "About me / Sobre mí" apunta a `index.html#about` (sección `id="about"` en la home). El CTA del header es `Book a call` / `Reservar una llamada`, y el lang-switch es US/CO/RU.
- **Fuente única de idiomas: `tools/locales.mjs`** (registro por locale: `dir`, prefijo de `assets`, `base`, hreflang/bandera, sufijo de data, nav y textos de footer). NINGÚN tool debe volver a escribir `lang === 'es'` ni prefijos (`../assets`, `'es/'`) a mano: se derivan del registro. Añadir un idioma = agregar una entrada aquí (p. ej. `ru` con `available: true`) + su contenido.
- **Fuente única de nav/footer EN y ES: `tools/site-shell.mjs`** (header + mobile drawer + footer), que consume `locales.mjs`. NUNCA editar el header/footer a mano en un HTML: se regenera.
- `tools/apply-nav.mjs` es idempotente (consume la indentación de la línea antes de reemplazar).
- Páginas estáticas top-level (EN y ES): las pinta `tools/apply-nav.mjs` consumiendo `site-shell.mjs`.
- Hub de servicios + 6 páginas de servicio (EN/ES): se generan desde `assets/js/hire-data*.js` + `tools/build-hire-pages.mjs`, que también consume `site-shell.mjs`.
- `es/sesiones.html` / `sessions.html` son la página Sessions/Sesiones con el widget de clases (`assets/js/class-booking.js`, bilingüe vía `JH_HIRE.lang`; carga `hire-data-es.js` en ES y `hire-data.js` en EN). Los archivos usan distinto nombre por idioma (`sessions.html` EN vs `sesiones.html` ES), mapeados en `ALT_PAGE` dentro de `site-shell.mjs`.
- Página demo suelta que NO lleva el shell del sitio (se revisa aparte): `gallery.html`.
- Tras cambiar el nav (orden/labels/href/CTA/flags) o los textos del hire, ejecutar siempre:
  ```
  node tools/apply-nav.mjs
  node tools/build-hire-pages.mjs
  node tools/build-contract-pages.mjs
  node tools/apply-favicons.mjs
  node tools/apply-seo.mjs
  node tools/build-sitemap.mjs
  node tools/i18n-sync-check.mjs
  node tools/seo-check.mjs
  ```
- Los datos del carrito (precios mensuales, monedas, meses, WhatsApp/Telegram) viven en `assets/js/hire-data.js` (EN) y `hire-data-es.js` (ES); el carrito es `assets/js/hire.js` y su CSS está en `styles.css` (bloque "Monthly hire").

## SEO (canonical, hreflang, structured data)
- **Dominio canónico = `https://soyjacqueshauzeur.dev`** (coincide con `CNAME`). Vive en `tools/seo.mjs` (`SITE`): no hardcodear el dominio en ningún otro sitio.
- `tools/apply-seo.mjs` es idempotente y **dueño** del bloque `<!-- seo:start --> … <!-- seo:end -->` en cada HTML: canonical self-referencing, `hreflang` EN/ES/x-default, `robots`, Open Graph/Twitter y JSON-LD `@graph` (Organization + Person + WebSite + nodo de página). NO editar ese bloque a mano.
- JSON-LD por tipo de página: home (Organization/Person/WebSite); servicios (hub `OfferCatalog`+`ItemList`; cada servicio `Service`+`Offer` mensual + `FAQPage`); sesiones (`Course`); clientes (`CollectionPage`); blog (`Blog`/`BlogPosting`); resto (`WebPage`). Se construye desde `assets/js/hire-data*.js`.
- `noindex, nofollow`: `contract.html`, `es/contrato.html`, todos los `*-hire.html`, `gallery.html`, `blog-t.html`, `price-t.html`.
- `tools/build-sitemap.mjs` genera `sitemap.xml` (con `xhtml:link` hreflang, ambos idiomas) y `robots.txt`; excluye páginas `noindex`.
- `tools/seo-check.mjs` valida canonical/robots/JSON-LD/hreflang recíproco/cobertura de sitemap. Debe terminar en `PASS`.
- Marca: `assets/logo.png` (512), `assets/logo-1920.png`, `assets/og-default.png` (1200×630), regenerados con `node tools/build-logo.mjs` (requiere Inkscape).
- Open Graph por servicio: `assets/og/<stem>.<idioma>.png` (6 servicios × EN/ES = 12), generados desde `hire-data*.js` con `node tools/build-og.mjs` (Inkscape). `apply-seo.mjs` las usa en las páginas de servicio; el resto usa `og-default.png` y el blog la imagen del artículo.
- Títulos ≤60 y descripciones ≤160 caracteres; el `hreflang` de los flags del nav usa códigos válidos (`en`/`es`/`ru`), no ISO de bandera.

## Monedas FX (precios USD + moneda local ≈)
- `assets/js/fx.js` (compartido EN/ES, se carga ANTES de hire.js / class-booking.js): tasas de Frankfurter sin API key (`https://api.frankfurter.dev/v2/rates?base=USD&quotes=…`), caché en `localStorage['jh-fx']` por 24 h, moneda secundaria por defecto `COP` en `localStorage['jh-fx-sel']`.
- Los precios canónicos SIEMPRE están en USD. Cada precio renderizado puede llevar un `<span class="price-approx" data-approx="<usd>">` que fx rellena con `≈ <local>`. Selector de moneda = cualquier elemento `[data-fx-anchor]` (etiquetas nativas de moneda).
- Quote estructurado para futuras pasarelas en `localStorage['jh-pay-quote']` (moneda, items en USD + local, totales) — se escribe al cambiar carrito/horas/moneda. La llamada a PayPal/MercadoPago es una etapa futura; aquí solo se persiste.
- `hire.js` y `class-booking.js` exponen helpers `AX(n)` (span approx) / `renderFX()` / `renderNodeFX(id, usd)` y escuchan `jh:fxchange`. En FX no hay textos por idioma: los nombres de moneda son nativos y el label del picker usa `<html lang>`.

