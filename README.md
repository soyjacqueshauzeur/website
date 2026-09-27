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
2026/07/…          posts del blog
tools/…            generadores y verificación (Node)
.github/workflows/deploy.yml   despliegue a GitHub Pages
```

## Generadores y verificación

Tras cambios de nav, textos de servicios/contratos o favicons, ejecuta:

```bash
node tools/apply-nav.mjs          # header/footer canónico en páginas top-level
node tools/build-hire-pages.mjs   # hub de servicios + 6 páginas de servicio (EN/ES)
node tools/build-contract-pages.mjs # contratos por servicio + contrato del carrito
node tools/apply-favicons.mjs     # enlaces de favicon en todas las páginas
node tools/i18n-sync-check.mjs    # verifica EN vs ES (debe terminar en PASS)
```

Nuevo post del blog (crea el HTML EN/ES y registra la entrada en `blog-data*.js`):

```bash
node tools/new-post.mjs --slug mi-nota --title "Título" --excerpt "Resumen" \
  --title-es "Título ES" --excerpt-es "Resumen ES" --image assets/img/x.webp --category process
```

## Despliegue (GitHub Pages)

- Remote: `git@github.com:soyjacqueshauzeur/website.git` (SSH).
- Publish: **GitHub Actions** (`.github/workflows/deploy.yml`) al hacer push a `master`; también se puede lanzar a mano (`workflow_dispatch`).
- Dominio: `CNAME` = `soyjacqueshauzeur.com` (configúralo también en *Settings → Pages → Custom domain*).
- `.nojekyll` evita que Jekyll procese los archivos.

```bash
git push -u origin master
```

## Licencia y assets

- Código: ver `LICENSE` (si se agrega).
- Los **logos de clientes** son marcas de sus titulares; las **fotos** tienen sus fuentes (ver `assets/img/CREDITS.md`) y las **fuentes tipográficas** su propia licencia. No se redistribuyen bajo la licencia del código.
