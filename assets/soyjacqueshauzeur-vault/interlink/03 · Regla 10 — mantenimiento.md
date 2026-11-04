---
title: "Regla 10 — mantenimiento al añadir una página"
tipo: reglas
tags: [il/reglas, seo]
---

# 🔧 Regla 10 · Mantenimiento — añadir una página nueva

Cada página nueva tiene **cuatro pasos** en Obsidian y **una verificación** en el build. Si te saltas uno, `link-check` falla (y si no falla, la página queda huérfana, que es peor porque nadie te avisa).

---

## Paso 1 · Crear su nota en `interlink/paginas/`

**Por qué.** El mapa de Obsidian es el plano del sitio. Una página sin nota es una página que no existe en el diseño: nadie sabe qué debe enlazarla ni a qué debe enlazar.

**Cómo.**
1. Crea `interlink/paginas/<nombre>.md`. El nombre debe ser **el nombre del archivo sin `.html`** (`marketing.html` → `marketing.md`), para que el wikilink `[[marketing]]` resuelva solo.
2. Frontmatter mínimo:

```yaml
---
title: "Servicio · Nombre"
url: /nombre.html
url_es: /es/nombre.html
tipo: servicio        # raiz | hub | servicio
cluster: adquisicion  # adquisicion | automatizacion | comercio | dinero
tags: [il/servicio]   # il/raiz | il/hub | il/servicio | il/post
---
```

3. Cuerpo con las tres secciones del resto de notas:
   - **Enlaces salientes (obligatorios)** — tabla `destino | ancla sugerida | ubicación`.
   - **Enlaces entrantes (deben existir)** — quién tiene que apuntar aquí.
   - **Cambios en la web** — qué tocar en el HTML o en el generador.

> [!warning] Idioma
> El nombre del archivo es el mismo en los dos idiomas (regla 8). La nota describe **la pareja** EN/ES, no una sola.

---

## Paso 2 · Enlazarla desde su hub de nivel superior

**Por qué.** Es lo que le da profundidad ≤ 3 y, sobre todo, **el primer enlace desde una página de nivel superior** — el requisito que `link-check` exige aparte del mínimo de 3 entrantes.

**Cómo.**

| Si la página es… | Su hub es… | Dónde se añade el enlace |
|---|---|---|
| Un servicio | [[services]] | `tools/build-hire-pages.mjs` → `hubBody()` (catálogo) |
| Un artículo | [[blog-listing]] | `assets/js/blog-data*.js` (el grid estático sale de ahí) |
| Una página de sección | [[home]] | tarjeta o bloque de la home |
| Una página legal/utilidad | *no aplica* | las `noindex` no entran en el flujo (regla 6) |

**En la práctica:** no edites el HTML a mano. Añade el dato en el generador (`hire-data*.js`, `blog-data*.js` o `build-hire-pages.mjs`) y vuelve a correrlo. Si editas el HTML, el siguiente build lo borra.

---

## Paso 3 · Añadirla a 1–2 páginas hermanas

**Por qué.** El hub da el enlace de nivel superior; las hermanas dan **relevancia temática**. Dos servicios del mismo cluster que se enlazan se refuerzan mutuamente para consultas relacionadas.

**Cómo.**
1. Si pertenece a un cluster con simetría (regla 7), añade el par en `CLUSTER_PAIRS` de `tools/link-check.mjs`:
   ```js
   const CLUSTER_PAIRS = [
     ['marketing.html', 'campaigns.html'],
     ['marketing.html', 'ecommerce.html'],
     ['ai.html', 'chatbots.html'],
     ['ecommerce.html', 'financial-planning.html'],
     // ← la pareja nueva aquí
   ];
   ```
2. Asegúrate de que el enlace existe **en los dos sentidos** y en el cuerpo, no solo en el catálogo.
3. Máximo 2 hermanas: más enlaces por página = menos valor por enlace (y te acercas al límite de 8 de la regla 3).

---

## Paso 4 · Actualizar la tabla del índice

**Por qué.** Esa tabla es el diagnóstico que se usó para arreglar el sitio (4 páginas huérfanas, 0 enlaces entrantes). Si no se actualiza, en tres meses vuelve a describir un sitio que ya no existe y deja de servir para detectar regresiones.

**Cómo.**
1. Añade la fila con los enlaces entrantes **reales** (no los deseados): `node tools/link-check.mjs` imprime la columna `in` de cada página.
2. Si la página es nueva, entra con `0 ⁄ 0` y **no la marques como hecha** hasta que el checker la vea con 3 o más.
3. Actualiza también el contador de URLs indexables del encabezado si cambió.

---

## Paso 5 · Verificar (esto no es opcional)

```bash
node tools/apply-interlink.mjs      # si tocaste enlaces internos
node tools/apply-seo.mjs            # canonical, hreflang, JSON-LD
node tools/build-sitemap.mjs        # la URL nueva entra al sitemap
node tools/link-check.mjs           # reglas 3, 4, 6, 7, 8, 9
node tools/i18n-sync-check.mjs      # paridad EN/ES
node tools/seo-check.mjs            # canónica / JSON-LD / hreflang
```

**Criterio de terminado:** los cuatro primeros en `PASS` y la página aparece en el sitemap.

---

## Ejemplo completo (servicio nuevo: "Web")

1. `interlink/paginas/web.md` con `url: /web.html`.
2. Dato en `assets/js/hire-data.js` + `hire-data-es.js` (id, file, price, copy).
3. `node tools/build-hire-pages.mjs` → crea `web.html` y `es/web.html`; el hub ya la lista.
4. Par de cluster en `link-check.mjs` (`web ↔ ecommerce`) y enlace cruzado en las dos páginas.
5. Fila nueva en la tabla del índice.
6. Secuencia de verificación → todo en PASS.

**Tiempo real:** 20–30 minutos. El 80% es escribir el copy, no el enlazado.

---

## Errores típicos

| Error | Qué pasa | Cómo se detecta |
|---|---|---|
| Crear la nota pero no enlazarla desde el hub | página huérfana | `in 0` en link-check |
| Enlazarla solo desde el footer | link farm sitewide | aviso de regla 9 punto 1 |
| Enlazarla desde una página `noindex` | no cuenta como entrante | regla 6 |
| Olvidar la versión ES | estructura rota | `i18n-sync-check` en FAIL |
| Editar el HTML generado a mano | el build lo borra | la página vuelve a `in 0` tras `build-hire-pages` |
| Poner el enlace en JS | el crawler no lo ve | regla 9 punto 2 |
