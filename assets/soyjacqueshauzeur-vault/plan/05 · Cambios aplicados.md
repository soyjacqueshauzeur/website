---
title: "Cambios aplicados — explicación SEO"
tipo: changelog
tags: [plan, seo, changelog]
---

# 📋 Cambios aplicados — qué se tocó y por qué (SEO)

Registro completo de la intervención sobre `soyjacqueshauzeur.dev`. Cada bloque: **qué se cambió**, **por qué importa para SEO** y **cómo se verifica**.

> [!success] Estado final
> `link-check` · `i18n-sync-check` · `img-check` · `seo-check` → **PASS**
> 30 URLs indexables · 0 huérfanas · todas a ≤ 2 clics de la home.

---

## 1 · Enlazado interno real (el arreglo de mayor impacto)

### Qué se cambió
Se creó `tools/apply-interlink.mjs`, que escribe **HTML estático** dentro de los mismos contenedores que el JS rellena después:

| Dónde | Antes | Ahora |
|---|---|---|
| Home | 0 enlaces a servicios | 6 tarjetas estáticas + 3 artículos |
| Hub de servicios (`services.html`) | enlazaba a las 6 `*-hire.html` (**noindex**) | enlaza a las 6 páginas de servicio reales |
| Cada página de servicio | solo el panel JS | 5 servicios hermanos + 1:1 + clientes |
| `clients.html` | 0 enlaces | leyenda con los 6 servicios |
| `blog.html` | `#blog-grid` vacío en el HTML | los 4 artículos como enlaces reales |
| Cada artículo | sin enlace a la oferta | tarjeta lateral → su servicio + listado |
| `sessions.html` / `sesiones.html` | sin salidas | 6 enlaces (servicios, blog, clientes) |

### Por qué importa
Cuatro de las seis páginas de servicio **no tenían ni un solo enlace entrante**: existían solo en el sitemap. Un crawler que no encuentra enlaces no asigna autoridad, no entiende la jerarquía y rara vez indexa con prioridad. El listado del blog se pintaba por JS: Google veía una página sin artículos.

Resultado medido por `link-check`:

- **0 páginas huérfanas** (antes: 4 servicios + 3 artículos).
- **Profundidad máxima: 2 clics** desde la home (antes: ∞).
- **Entradas por página: 3 a 10** (mínimo exigido: 3).

### El detalle que casi nadie hace bien
El fallback estático **no duplica** contenido: `hire.js` y `blog.js` hacen `innerHTML = ''` al cargar y sustituyen el bloque. El usuario ve la versión interactiva, el crawler lee la estática.

---

## 2 · Reglas convertidas en verificaciones automáticas

`tools/link-check.mjs` (nuevo) falla el build si se rompe cualquiera de estas reglas del mapa [[00 · Índice interlink]]:

| Regla | Qué comprueba |
|---|---|
| **3 · Cantidad** | ≥3 entrantes, ≥1 desde nivel superior, ≤3 clics, ≥3 salientes |
| **4 · Anclas** | prohibidas («clic aquí», «leer más»), vacías, ambiguas, sobre-optimizadas |
| **6 · noindex** | ninguna página indexable enlaza a una `noindex` |
| **7 · Clusters** | los pares de servicios se enlazan en ambos sentidos |
| **8 · Bilingüe** | ningún enlace del cuerpo cruza de idioma |
| **9 · Qué no hacer** | enlaces ocultos, `nofollow` interno, mismo destino >10 veces, footer farm |

### Por qué importa
Las reglas escritas en un documento se incumplen en la tercera semana. Convertidas en un comando, no. Es la diferencia entre una auditoría (foto) y un control (bucle).

---

## 3 · FAQPage que describía contenido inexistente (punto F)

### Qué se cambió
Las 12 páginas de servicio declaraban un `FAQPage` en el JSON-LD con preguntas **que no aparecían en la página**. Se creó `tools/service-faq.mjs` como **fuente única**: `apply-seo.mjs` lo convierte en JSON-LD y `build-hire-pages.mjs` lo pinta como `<section id="faq">` visible.

### Por qué importa
- Google exige que el contenido estructurado esté **en la página**. Declararlo sin mostrarlo es una inconsistencia que puede costar credibilidad del marcado.
- Desde 2023 los rich results de FAQ solo se muestran a webs gubernamentales o sanitarias: el marcado sin contenido visible era **riesgo sin beneficio**.
- Y el contenido **faltaba**: las páginas de servicio tenían 291 palabras. Ahora responden precio, permanencia y combinación de servicios.
- Efecto medido: `marketing.html` **291 → 637 palabras**; `services.html` **291 → 559**.

---

## 4 · `hreflang="ru"` apuntando al inglés (punto G)

### Qué se cambió
`site-shell.mjs` renderizaba los 3 idiomas de `LANG_ORDER` aunque `ru` no existiera. Ahora filtra por `available`:

```js
LANG_ORDER.filter((k) => locale(k).available).map(...)
```

### Por qué importa
Cada página declaraba que su versión rusa era la home inglesa: señal de idioma contradictoria en 30 páginas. `hreflang` mal declarado hace que Google ignore el clúster de idiomas completo, y con él la reciprocidad EN/ES que sí funciona.

Verificación: `hreflang="ru"` en el sitio → **0**.
Detalle en [[02 · G — hreflang de ruso falso]].

---

## 5 · Rastros de la plantilla de fotografía

### Qué se cambió
| Elemento | Dónde | Antes |
|---|---|---|
| Comentario de cabecera del CSS | `styles.css` → `critical.css` → 49 páginas | «Modern Photography Studio HTML Template… designed for commercial photographers» |
| Copy del blog en la home | `index.html` | «a working note about a lighting setup… colour management… a frame we kept» |
| Título y meta del blog | `blog.html`, `es/blog.html` | «Notes from the studio — working notes on light, colour and process… making pictures» |
| CTA de cierre del blog | ambos | «We are always looking for working photographers, retouchers and producers… Pitch us a note» |
| Enlace `sparrow` | footer de las 49 páginas | proyecto ajeno repetido sitewide |
| 7 ramas `lang === 'es'` | 5 tools (`apply-interlink`, `apply-nav`, `apply-seo`, `seo-check`, `build-llms`) | el nombre de `sesiones.html` se resolvía a mano en cada tool; ahora lo resuelve `pageFile()` en el registro (ver [[Idiomas]]) |
| 3 enlaces muertos `href="#"` | footer de las 49 páginas | Privacy · Imprint · Sitemap apuntando a la propia página (147 autoenlaces) |
| 6 logos de cliente con `href="#"` | `clients.html` + ES | clientes sin web con enlace a sí mismos |
| «Read more» | `index.html` | ancla genérica (regla 4) |
| «35+ notas publicadas · 06+ disciplinas» | `blog.html` | cifras falsas (hay 4) |

### Por qué importa
Google construye un **perfil temático** del sitio. Un dominio que habla de marketing, IA y automatización, y a la vez de calibración de color y fotografía de estudio, no tiene tema: compite mal en todo. El copy de plantilla es, además, la señal más clara de «sitio sin terminar» para un revisor de calidad.

Y `sparrow` en el footer era exactamente el patrón de la regla 9 punto 1: un enlace ajeno repetido en todas las páginas.

---

## 6 · Enlaces a páginas `noindex` (punto 6 · regla)

### Qué se cambió
- `services.html` enlazaba a las 6 páginas `*-hire.html` (`noindex, nofollow`). Ahora enlaza a `marketing.html`, `campaigns.html`…
- Cada página de servicio enlazaba a su `*-hire.html` con dos botones. Ahora es un botón que abre el carrito, donde el contrato sí está disponible.
- El enlace al contrato unificado del hub pasó de `<a href="contract.html">` a botón del carrito.

### Por qué importa
Un enlace a una página `noindex` es un **callejón sin salida**: transfiere autoridad a una URL que Google no indexa y no devuelve nada. El flujo interno debe circular solo entre páginas que compiten.

---

## 7 · Los `404` se habían colado en el sitemap

### Qué se cambió
`apply-seo`, `seo-check` y `build-sitemap` no excluían `404.html`: el pipeline les puso `index, follow` y las metió en el sitemap (**32 URLs**). Se añadieron a la lista de exclusión de los tres tools.

### Por qué importa
Un sitemap con páginas de error es una contradicción que se reporta como incidencia en Search Console. Vuelta a **30 URLs**, las que deben estar. (Es también la razón por la que `seo-check` pasó a PASS: antes fallaba por estos dos archivos.)

---

## 8 · Anchas y recuento de enlaces (regla 9)

### Qué se cambió
El primer intento de enlazar los tags de `clients.html` produjo **22 enlaces a `marketing.html`**, 12 a `campaigns.html` y 8 a `chatbots.html` en una sola página. Se sustituyó por una leyenda con **un enlace por servicio**. Máximo por destino en esa página: **1**.

También se cambió el CTA de las tarjetas de servicio de «View this service» (6 destinos distintos con el mismo ancla) a «Hire Marketing», «Hire Chatbots»… Anclas únicas y descriptivas.

### Por qué importa
Repetir el mismo enlace no lo hace más importante: diluye. Y 6 anclas idénticas apuntando a 6 destinos distintos es la definición de ancla ambigua.

---

## 9 · Duplicados de host (punto H) — pendiente

El repo ya hace lo que puede (canonical absoluto, sitemap sin `www`). El 301 real necesita consola: **Settings → Pages → Enforce HTTPS** + CNAME de `www`. Detalle y comandos de verificación en [[03 · H — duplicados de host]].

---

## 10 · Documentación creada en el vault

```
interlink/    mapa de enlaces internos: reglas, páginas, reglas 9 y 10
keywords/     plan de keywords long-tail por servicio
plan/         ejecución, F, G, H, roadmap y este changelog
Idiomas.md    regla 8 bilingüe y sugerencias
```

---

## Antes y después

| Señal | Antes | Ahora |
|---|---|---|
| Páginas huérfanas | 7 | **0** |
| Profundidad máxima | inalcanzable | **2 clics** |
| Enlaces entrantes por página (mín.) | 0 | **3** |
| Palabras en una página de servicio | 291 | **559–637** |
| Páginas con FAQ visible | 0 | **12** |
| `hreflang` inválidos | 30 páginas | **0** |
| Enlaces a `noindex` | 14 por página de servicio | **0** |
| URLs en el sitemap | 32 (2 falsas) | **30** |
| Enlaces internos en el HTML de la home | 5 (solo nav) | **10 contextuales** |

---

## Lo que esto NO arregla

Ninguno de estos cambios genera tráfico por sí solo. Quitan el freno técnico: a partir de aquí Google **puede** rastrear, entender y confiar en el sitio. El motor sigue siendo el contenido long-tail y los enlaces externos — ver [[04 · Roadmap 90 días]].

**Expectativa realista: resultados visibles a partir del mes 4–6.**

## Cómo se reproducen los checks

```bash
node tools/apply-interlink.mjs
node tools/apply-seo.mjs
node tools/build-sitemap.mjs
node tools/link-check.mjs
node tools/i18n-sync-check.mjs
node tools/seo-check.mjs
```
