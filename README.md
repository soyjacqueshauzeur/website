# SoyJacquesHauzeur — sitio web

Sitio estático bilingüe (EN en la raíz, ES en `/es/`) de Jacques Hauzeur: home, clientes, 1:1 (sesiones), servicios mensuales ("hire"), contratos, blog y carrito.

## Vista local

```bash
python3 -m http.server 8080
# http://localhost:8080/            (EN)
# http://localhost:8080/es/         (ES)
```

## Estructura

```
index.html, services.html, clients.html, sessions.html, blog.html, …   EN (raíz)
es/…                                                                    ES
assets/js/…        datos y lógica (hire-data*.js, contract-data*.js, blog-data*.js, fx.js, hire.js …)
assets/css/…       styles.css, blog.css
assets/img/…       logos de clientes, fotos, flags
assets/logo.png, assets/logo-1920.png, assets/og-default.png   marca (schema.org / Open Graph)
assets/og/<servicio>.<idioma>.png    tarjeta Open Graph por servicio (12)
blog/<año>/<mes>/…      posts del blog EN (p.ej. blog/2026/07/…)
es/blog/<año>/<mes>/…   posts del blog ES (mismo slug; p.ej. es/blog/2026/07/…)
robots.txt, sitemap.xml generados
tools/…            generadores y verificación (Node)
.github/workflows/deploy.yml   despliegue a GitHub Pages
```

## Generadores y verificación

Tras cambios de nav, textos de servicios/contratos, favicons o SEO, ejecuta en orden:

```bash
node tools/apply-nav.mjs          # header/footer canónico en páginas top-level
node tools/build-hire-pages.mjs   # hub de servicios + 6 páginas de servicio (EN/ES)
node tools/build-contract-pages.mjs # contratos por servicio + contrato del carrito
node tools/apply-favicons.mjs     # enlaces de favicon en todas las páginas
node tools/apply-seo.mjs          # canonical, hreflang, robots, OG/Twitter y JSON-LD
node tools/build-sitemap.mjs      # sitemap.xml + robots.txt
node tools/i18n-sync-check.mjs    # verifica EN vs ES (debe terminar en PASS)
node tools/seo-check.mjs          # verifica canonical/robots/JSON-LD/hreflang/sitemap
```

La marca (`assets/logo.png`, `logo-1920.png`, `og-default.png`) se regenera desde `assets/favicon.svg`, y las tarjetas OG por servicio desde `hire-data*.js`:

```bash
node tools/build-logo.mjs         # requiere Inkscape
node tools/build-og.mjs           # 12 tarjetas OG (6 servicios × EN/ES) · requiere Inkscape
```

SEO: el dominio canónico y la entidad de marca viven en `tools/seo.mjs`; los idiomas en `tools/locales.mjs`.

Nuevo post del blog (crea el HTML EN/ES y registra la entrada en `blog-data*.js`):

```bash
node tools/new-post.mjs --slug mi-nota --title "Título" --excerpt "Resumen" \
  --title-es "Título ES" --excerpt-es "Resumen ES" --image assets/img/x.webp --category process
```

## Despliegue (GitHub Pages)

- Remote: `git@github.com:soyjacqueshauzeur/website.git` (SSH).
- Publish: **GitHub Actions** (`.github/workflows/deploy.yml`) al hacer push a `main`; también se puede lanzar a mano (`workflow_dispatch`).
- Dominio: `CNAME` = `soyjacqueshauzeur.dev` (configúralo también en *Settings → Pages → Custom domain*).
- `.nojekyll` evita que Jekyll procese los archivos.

```bash
git push -u origin main
```

## Licencia y assets

- Código: ver `LICENSE` (si se agrega).
- Los **logos de clientes** son marcas de sus titulares; las **fotos** tienen sus fuentes (ver `assets/img/CREDITS.md`) y las **fuentes tipográficas** su propia licencia. No se redistribuyen bajo la licencia del código.
