# AGENTS.md — Sitio bilingüe EN/ES

Reglas para este repositorio (web estática de Jacques Hauzeur):

## i18n: cada cambio se aplica a TODOS los idiomas
- EN vive en la raíz: `index.html`, `blog.html`, `services.html`, `clients.html`, `studio.html`, `contact.html`.
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
La barra de nav canónica es: `Home · Clients · 1:1 · Services · About me · Blog · Contact` (ES: `Inicio · Clientes · 1:1 · Servicios · Sobre mí · Blog · Contacto`). "About me / Sobre mí" apunta a `index.html#about` (sección `id="about"` en la home).
- Nav/footer de las páginas estáticas top-level (EN y ES): fuente en `tools/apply-nav.mjs`.
- Hub de servicios + 6 páginas de servicio (EN/ES): se generan desde `assets/js/hire-data*.js` + nav/footer definidos en `tools/build-hire-pages.mjs`.
- Tras cambiar el nav (orden/labels/href) o los textos del hire, ejecutar siempre:
  ```
  node tools/apply-nav.mjs
  node tools/build-hire-pages.mjs
  node tools/i18n-sync-check.mjs
  ```
- Los datos del carrito (precios mensuales, monedas, meses, WhatsApp/Telegram) viven en `assets/js/hire-data.js` (EN) y `hire-data-es.js` (ES); el carrito es `assets/js/hire.js` y su CSS está en `styles.css` (bloque "Monthly hire").

