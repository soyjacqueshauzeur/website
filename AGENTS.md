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

## Blog — diseño, funciones y CSS
### Estructura y URLs
- Listado: `blog.html` (EN) / `es/blog.html` (ES). Artículos: `blog/<año>/<mes>/<slug>.html` (EN) y `es/blog/<año>/<mes>/<slug>.html` (ES), **mismo slug**. Archivo mensual: `.../<mes>/index.html`.
- Datos: `assets/js/blog-data.js` (`window.BLOG_POSTS`) y `blog-data-es.js` (`window.BLOG_POSTS_ES`). Campos por post: `slug, title, excerpt, category, date` (p. ej. `"02 Oct 2026"`), `author, readTime` (`"7 min"`), `image, featured, url`.
- La `url` es el mismo string relativo (`blog/<año>/<mes>/<slug>.html`) en ambos idiomas; desde `/es/` resuelve bajo `/es/blog/…`. **En ES la `image` lleva `../assets/…`.**
- **Imágenes del blog = media root** (Screaming Architecture: grilla el dominio `blog → año → mes → artículo`): carpeta `assets/img/blog/<año>/<mes>/<slug>/` con nombres **autodescriptivos** `<año>-<mes>-<slug>-<rol>.<ext>`, donde `<rol>` = `top` (imagen top/lead), `fig-01`, `fig-02`… y `thumbnail` si aplica. Ej.: `assets/img/blog/2026/10/ia-en-el-trabajo/2026-10-ia-en-el-trabajo-top.webp`. Se **comparten EN y ES** (una sola copia): EN referencia `assets/img/blog/…`, ES `../assets/img/blog/…`. **NUNCA** volver a dejar imágenes de post sueltas en `assets/img/` ni dentro de `blog/<año>/<mes>/` (solo va el `.html`).
- **Categorías válidas** (botones de filtro): `all, setup, process, business, archive, philosophy, gear`. `blog.js`/`blog-es.js` recalculan los conteos desde el data (`updateFilterCounts`); no hay que mantener los números a mano.
- Home: `assets/js/journal-latest.js` pinta los **3 posts más recientes** (`#journal-grid`) leyendo el data del idioma según `<html lang>`.

### Estructura de un artículo (HTML)
- `header.site-header` + `div.mobile-drawer` (header/footer **“demo” del blog**, distinto del shell del sitio — pendiente unificarlos con `site-shell.mjs`) → `main#main`.
- `section.article-hero` > `.article-hero-grid` (2 columnas): `.article-hero-text` (con `.eyebrow` —de ahí `apply-seo` saca la fecha—, `h1`, `.article-meta-row` con `.author`/`.category`/`.read-time`) y `.article-hero-media` (imagen). Si no hay imagen hero: `style="grid-template-columns: minmax(0,1fr)"` y se omite `.article-hero-media`.
- `section.article-body` > `.article-container` > `.article-content`:
  - `.article-content` es un **grid** (`1fr / 320px`): `.article-main` (texto) + `.article-sidebar` (`.sidebar-card`/`.sidebar-link`).
  - **Imagen top**: `<figure class="article-figure article-figure--wide">` como **hijo directo de `.article-content`** (antes de `.article-main`), para ocupar el ancho completo (`grid-column: 1/-1`). Dentro de `.article-main` quedaría limitada a la columna.
  - Bloques: `p.article-lead`, `h2` (uppercase), `p`, `ul`/`ol`, `blockquote`, `div.article-pull`, `div.tech-spec` (`.tech-spec-list`), `figure.article-figure` (`--wide`/`--full`) + `figcaption`.
  - **Bibliografía**: `<h2 id="bibliography">` + `<ol class="article-references">` con `<li id="ref-N">`; las citas inline son `<a href="#ref-N">[N]</a>` (clicables).
  - `footer.article-footer`: `.article-tags` + `.share-row` (`.share-btn[data-share="twitter|linkedin|email|copy"]`).

### CSS
- `assets/css/blog.css` — todo lo del blog: `.hero--blog`, `.featured-strip`/`.featured-article`/`.featured-media`/`.featured-pill`/`.featured-content`/`.featured-meta` (destacado), `.blog-grid`, `.filter-row`/`.filter-btn`; y en artículos `.article-hero*`, `.article-body`, `.article-container` (**`max-width: 1440px`**), `.article-content` (grid), `.article-main`, `.article-lead`, `.article-sidebar`/`.sidebar-card`/`.sidebar-link`, `.article-figure*`, `.tech-spec*`, `.article-pull`, `.article-footer`, `.article-tags`, `.share-row`, `.lightbox`, `.reading-progress`.
- `assets/css/styles.css` — **tokens** en `:root` + componentes globales (nav, botones, secciones, hire, footer). **No duplicar tokens en `blog.css`: usar `var(--…)`.**
- **Paleta dark-only**: carbón (`--ink-000 … --ink-elev`), marfil/grises (`--paper*`), acento lima en 6 tonos (`--lime`, `--lime-soft`, `--lime-deep`, `--lime-ink`, `--lime-ink-deep`, `--lime-olive`), cobalto `--cobalt`, rojos `--danger`/`--danger-soft`; secciones “tile” en modo inverso (`.tile-section`, `--bg-tile`). **No meter colores hardcodeados**: todo sale de `:root`.

### JavaScript
- `assets/js/blog.js` (EN) / `blog-es.js` (ES):
  - Listado: filtro por categoría, **scroll infinito** (sentinel + IntersectionObserver), reveal on-scroll, conteos.
  - Artículo: **lightbox**, botones de compartir, **barra de progreso de lectura** y resaltado del sidebar (`sidebar-link.active`).
- **Lightbox**: al hacer click en la imagen top (`.article-hero-media img`, `.article-content figure img`, `.article-gallery img`) se abre `.lightbox` a tamaño completo (`max-width: 96vw; max-height: 88vh`). Se cierra con el botón `.lightbox-close`, clic en el fondo o `Esc`; con varias imágenes hay flechas ‹ ›.
- `assets/js/site.js`: nav/drawer, preferencia de idioma (cookie `lang`), hero A/B, sombra del header.
- **AdSense (artículos del blog)**: el **código único** es la constante `adsense` (string) en `assets/js/adsense.js`; para cambiar de unidad basta con reemplazar ese string. El módulo se auto-monta si existen `.article-main` y `.article-footer`, e inyecta el código tras `.article-lead` (config `ANCHOR`, o `'before-footer'`), entre comentarios `<!-- adsense:unit:start/end -->`. Cada artículo solo lo referencia con un bloque comentado `<!-- adsense.js:start -->…<!-- adsense.js:end -->` que añade `node tools/apply-adsense-tag.mjs` (idempotente; también limpia unidades inline antiguas). El loader del `<head>` lo pone `node tools/apply-adsense.mjs`.

### Vault de Obsidian (escritura y vínculos)
- En `assets/blog-vault/` vive un **vault de Obsidian** (abrirlo con “Open folder as vault”): una nota por artículo en `blog/<año>/<mes>/<slug>.md` (espejo de la web).
- Frontmatter por nota: `title, slug, lang, category, tags[], date, author, readTime, image, en, es` + canales propios `telegram`, `youtube`, `meet` (agenda Google Meet) — **estos reemplazan el antiguo “Del archivo”**.
- **Interlinks** con wikilinks `[[<slug>]]` (notas relacionadas) y **outlinks** (fuentes/bibliografía) como enlaces markdown. Los tags del frontmatter alimentan el panel de tags.
- Plantilla: `_templates/Blog post.md` (estructura de `blog-t.html`: 1 Contenido · 2 Imagen · 3 Taxonomía · 4 Meta). Índice/MOC: `Blog.md`. Referente de escritura: [blog-t.html](http://localhost:8080/blog-t.html).
- `blog-t.html` **ya no tiene** el punto 5 “Temas relacionados”: los relacionados se crean en Obsidian.

### Añadir un post (flujo)
1. `node tools/new-post.mjs --slug <slug> --title "…" --excerpt "…" --title-es "…" --excerpt-es "…" --image assets/img/<img> --category <cat> --read "7 min" --date "02 Oct 2026" [--featured]` → crea los HTML EN/ES y añade entradas en `blog-data*.js`.
2. Escribir el cuerpo en ambos HTML con la estructura de arriba (imagen top como figura full-width; citas `#ref-N`).
3. Si es destacado, actualizar el `.featured-strip` (estático) en `blog.html` y `es/blog.html` — el flag `featured` del data **no** lo usa el JS.
4. Imagen: `new-post.mjs` **copia** el `--image` a `assets/img/blog/<año>/<mes>/<slug>/<año>-<mes>-<slug>-top.<ext>` y ajusta las rutas solo. Guarda el archivo optimizado (`.webp`) y, si añades figuras, ponlas en esa misma carpeta como `<año>-<mes>-<slug>-fig-01.webp`, `…-fig-02.webp`…
5. Re-correr la secuencia (`apply-seo` → `build-sitemap` → `i18n-sync-check` → `seo-check`) e idempotencia.

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

