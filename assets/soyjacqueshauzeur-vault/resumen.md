---
title: "Resumen — intervención SEO completa"
tipo: resumen
tags: [resumen, seo]
---

# 📌 Resumen de la intervención

Todo lo hecho sobre `soyjacqueshauzeur.dev` a partir de la auditoría de Search Console. Esta nota es la puerta de entrada; el detalle está en [[05 · Cambios aplicados]] y en las notas de [[00 · Ejecución SEO (MOC)]].

> [!success] Estado final verificado
> ```
> link-check       → PASS   (reglas 3, 4, 6, 7, 8, 9)
> seo-check        → PASS
> i18n-sync-check  → PASS
> img-check        → PASS
> sitemap          → 30 URLs
> ```

## El diagnóstico de partida

| Dato (30 sep – 1 nov) | Valor |
|---|---|
| Clics | **0** |
| Impresiones | **35** en 3 meses |
| Consultas distintas | **1** (`chat marketing`) |
| Páginas con impresiones | 16 de 30 |

No era "estar abajo en el ranking": era que Google no tenía motivos para mostrar el sitio. Sitio de septiembre de 2026, sin autoridad, con 4 de 6 páginas de servicio huérfanas, contenido pintado por JS y copy de fotografía que confundía el tema.

## Los 9 cambios

### 1 · Enlazado interno (el de mayor impacto)
Nuevo `tools/apply-interlink.mjs`: escribe HTML estático dentro de los contenedores que rellena el JS.

- Home → 6 servicios (antes: 0 enlaces a servicios).
- Hub de servicios → las 6 páginas reales (antes: 6 páginas `noindex`).
- Cada servicio → 5 hermanos + 1:1.
- Listado del blog → los 4 artículos (antes: `<div>` vacío).
- Cada artículo → su servicio + el listado.
- `clients.html` → leyenda con los 6 servicios.
- `sesiones.html` → 6 salidas.

**Resultado:** 7 huérfanas → **0**; profundidad → **2 clics**; entradas por página **3–11**.

### 2 · Reglas convertidas en verificaciones
`tools/link-check.mjs` falla el build si se rompe cualquiera de las reglas del mapa: cantidad de enlaces, anclas, `noindex`, simetría de clusters, bilingüe, enlaces ocultos/rotos, `nofollow` interno, destinos repetidos, paridad EN/ES.

### 3 · FAQPage que describía contenido inexistente (F)
Las 12 páginas de servicio declaraban preguntas que no estaban en la página. Se creó `tools/service-faq.mjs` como fuente única: el JSON-LD y el bloque visible salen de la misma lista. Páginas de servicio: **291 → 557–637 palabras**.

### 4 · `hreflang="ru"` apuntando al inglés (G)
El nav anunciaba un idioma que no existe. Ahora `site-shell.mjs` solo pinta idiomas con `available: true`. `hreflang="ru"` en el sitio → **0**.
Home → 6 servicios (antes: 0 enlaces a servicios).
### 5 · Rastros de la plantilla de fotografía
Banner del CSS en las 49 páginas, copy del blog en la home, título/meta/CTA del blog, enlace `sparrow` del footer, cifras falsas («35+ notas» cuando hay 4), ancla «Read more».

### 6 · Enlaces a páginas `noindex`
14 enlaces por página de servicio a `*-hire.html`. Sustituidos por botones que abren el carrito; el hub apunta ahora a las páginas reales.

### 7 · Los `404` en el sitemap
Se les había puesto `index, follow` y entraban al sitemap (32 URLs). Excluidos en los tres tools: **30 URLs**.

### 8 · Anclas y recuento de enlaces
`clients.html` llegó a tener **22 enlaces a `marketing.html`** desde los tags. Sustituido por una leyenda con 1 enlace por servicio. Los CTA de tarjeta pasaron de «View this service» (6 destinos, mismo ancla) a «Hire Marketing», «Hire Chatbots»…

### 9 · Bilingüe centralizado
`sesiones.html` se mantiene (Opción B): renombrar no aporta SEO y GitHub Pages no puede emitir 301. En su lugar, el registro resuelve el nombre (`pageFile()` / `canonicalFile()`) y desaparecen **7 ramas `lang === 'es'`** de 5 tools.

## Lo que quedó por hacer

| Tarea | Por qué no se hizo |
|---|---|
| **301 de `www` y `http`** | Requiere GitHub Settings → *Enforce HTTPS* + CNAME de `www`. No se puede desde el repo. Ver [[03 · H — duplicados de host]]. |
| **Páginas legales** (`privacy`, `imprint`) | Una política de privacidad debe describir lo que el sitio hace de verdad. El footer ya las enlazará solo cuando existan. |
| **Contenido long-tail** | Es el motor, no un arreglo. Ver [[04 · Roadmap 90 días]]. |
| **`gallery.html`** | Demo de fotografía, `noindex` y sin enlaces entrantes. Pendiente de decidir si se borra. |

## Antes y después

| Señal | Antes | Ahora |
|---|---|---|
| Páginas huérfanas | 7 | **0** |
| Profundidad máxima | inalcanzable | **2 clics** |
| Entrantes mínimos por página | 0 | **3** |
| Palabras en una página de servicio | 291 | **557–637** |
| Páginas con FAQ visible | 0 | **12** |
| `hreflang` inválidos | 30 páginas | **0** |
| Enlaces a `noindex` | 14 por página | **0** |
| URLs en el sitemap | 32 (2 falsas) | **30** |
| Enlaces contextuales en la home | 0 | **10** |

## Expectativa realista

Ninguno de estos cambios genera tráfico por sí solo: **quitan el freno técnico**. Google ya puede rastrear, entender y confiar. El motor es el contenido long-tail ([[00 · Plan de keywords (MOC)]]) y los enlaces externos.

**Resultados visibles: mes 4–6.** No antes.

## Mapa de la documentación

| Nota | Contenido |
|---|---|
| [[00 · Ejecución SEO (MOC)]] | estado de los arreglos, comando a comando |
| [[05 · Cambios aplicados]] | el detalle técnico de cada cambio |
| [[00 · Índice interlink]] | el grafo de enlaces internos |
| [[01 · Reglas de enlazado]] | las 10 reglas |
| [[02 · Regla 9 — que no hacer]] · [[03 · Regla 10 — mantenimiento]] | operativa |
| [[01 · F — FAQPage sin contenido visible]] · [[02 · G — hreflang de ruso falso]] · [[03 · H — duplicados de host]] | los tres problemas concretos |
| [[04 · Roadmap 90 días]] | contenido, enlaces y expectativas |
| [[00 · Plan de keywords (MOC)]] · [[07 · English long-tail]] | qué escribir y para quién |
| [[Idiomas]] | regla bilingüe y estado EN/ES |

## Cómo se reproduce

```bash
node tools/apply-nav.mjs
node tools/build-hire-pages.mjs
node tools/build-contract-pages.mjs
node tools/apply-favicons.mjs
node tools/apply-interlink.mjs
node tools/apply-seo.mjs
node tools/build-sitemap.mjs
node tools/build-llms.mjs
node tools/build-critical.mjs && node tools/minify-css.mjs && node tools/apply-assets.mjs
node tools/link-check.mjs
node tools/i18n-sync-check.mjs
node tools/seo-check.mjs
```
