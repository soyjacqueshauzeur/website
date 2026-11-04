---
title: "Idiomas — regla 8 · Bilingüe"
tipo: idiomas
tags: [idiomas, seo]
---

# 🌐 Idiomas — EN / ES (y el futuro RU)

> [!info] Regla que gobierna este documento
> **El grafo es idéntico en EN y ES.** Cambian solo dos cosas: la ruta (`/marketing.html` → `/es/marketing.html`) y el ancla (traducida, no calcada).
> Un enlace del cuerpo **nunca** cruza de idioma. El cambio de idioma lo hace el flag del nav.
>
> Implementación: `tools/locales.mjs` es la única fuente de verdad. `tools/link-check.mjs` verifica la regla en cada build.

## Estado auditado hoy

| Comprobación | Resultado |
|---|---|
| URLs indexables | 30 (15 EN + 15 ES) |
| Enlaces del cuerpo que cruzan idioma | **0** ✅ |
| `hreflang` EN/ES/x-default | correcto y recíproco (lo emite `apply-seo.mjs`) |
| Títulos idénticos EN/ES (sin traducir) | **0 de 11** ✅ |
| Slugs de blog | mismo slug en ambos idiomas ✅ |
| Imágenes | una sola copia compartida (`../assets/…` desde ES) ✅ |
| `llms.txt` | uno por idioma ✅ |
| Flag de idioma | apunta a **la misma página**, no a la home ✅ |
| RU | `available: false` — no se anuncia ni se enlaza ✅ |

## Qué cambia y qué no (regla 8 en la práctica)

| Sí cambia | No cambia |
|---|---|
| La ruta: prefijo `/es/` | La estructura de la página |
| El `title` y la `description` | El `slug` del artículo |
| El ancla del enlace | El destino (misma página, mismo idioma) |
| El `hreflang` del flag | El `canonical` (siempre autorreferente) |
| El texto del cuerpo | El nombre del archivo de imagen (una copia) |

## Sugerencias

### 1 · `sesiones.html` — mantener el nombre, centralizar el alias (aplicado)

Se evaluaron las dos opciones. **Ganó B: mantener `es/sesiones.html`** y arreglar la causa real.

**Por qué no renombrar.**
- GitHub Pages no puede emitir un 301. `es/sesiones.html` ya está en el índice (1 impresión): renombrar obliga a un 404 o a un stub con `meta refresh` (redirect blando) y deja un archivo zombi.
- Una URL traducida es legítima y no penaliza: `hreflang` empareja `/sessions.html` con `/es/sesiones.html`, y el usuario hispanohablante ve su idioma en la barra de direcciones.
- El nombre nunca fue el problema: el problema eran **7 ramas `lang === 'es'`** repartidas en 5 tools (3 de ellas escritas por mí, violando la regla del propio repo).

**Qué se hizo.**

```js
// tools/locales.mjs — el registro pasa a ser el único que sabe el nombre
export const PAGE_FILES = {
  'sessions.html': { en: 'sessions.html', es: 'sesiones.html' }
};
export function pageFile(lang, logical) { ... }   // 'sessions.html' → 'sesiones.html'
export function canonicalFile(file) { ... }       // 'sesiones.html' → 'sessions.html'
```

`PAGE_ALIASES` se deriva ahora de `PAGE_FILES` (mismos valores, sin romper a `otherLangHref` ni `alternates`).

| Tool | Antes | Ahora |
|---|---|---|
| `apply-interlink.mjs` | `lang === 'es' ? 'sesiones.html' : 'sessions.html'` ×3 | `pageFile(lang, 'sessions.html')` |
| `apply-nav.mjs` | `'es/sesiones.html'` hardcodeado | `pageFile('es', 'sessions.html')` |
| `apply-seo.mjs` | regex `^(sessions\|sesiones)\.html$` | `canonicalFile(base) === 'sessions.html'` |
| `seo-check.mjs` | la misma regex | idem |
| `build-llms.mjs` | rama por idioma + clave hardcodeada ×2 | `pageFile(lang, 'sessions.html')` |
| `locales.mjs` (nav ES) | `['sesiones.html', '1:1']` | `[pageFile('es', 'sessions.html'), '1:1']` |

**Resultado:** cero ramas por idioma y cero regexes. Si algún día se renombra, se cambia **una línea** en `PAGE_FILES` y todo el sitio se adapta.

**Verificación:** los 4 checks en PASS; `sitemap`, `canonical`, `hreflang` y `es/llms.txt` siguen apuntando a `/es/sesiones.html`.

### 2 · Mantener el slug del artículo idéntico en los dos idiomas (verificado)

`blog/2026/09/chat-marketing.html` y `es/blog/2026/09/chat-marketing.html`. Es lo que permite que `hreflang` apunte a la pareja exacta y que el mapa de interlink sea una sola pieza. Si algún día se traduce el slug, `apply-seo` deja de encontrar la pareja.

**Qué se hizo:** `link-check.mjs` falla si un artículo no tiene gemelo con el mismo slug en el otro idioma (`slug de artículo sin pareja`). Antes dependía de que alguien se acordara.

### 3 · Traducir el ancla, no calcarla (verificado)

`Ver todos los servicios` ≠ `See all services` traducido literal (`Ver todo servicios`). Un ancla calcada se nota y, peor, repite la keyword en el idioma equivocado. En `apply-interlink.mjs` cada bloque tiene su copia por idioma.

**Qué se hizo:** `link-check.mjs` detecta anclas en páginas ES con palabras funcionales inglesas (`the, and, your, all, see, read, more, from, with…`) y falla. Buscó y encontró un bug real: la tarjeta lateral de los artículos ES mostraba el texto `es/chatbots.html` en vez de «Chatbots» — la etiqueta se resolvía con la ruta localizada en lugar del nombre del archivo. Corregido.

### 4 · Nunca traducir enlaces absolutos a mano (verificado)

El flag, el `hreflang` y el `canonical` los genera `site-shell.mjs` + `apply-seo.mjs`. Si alguien escribe `href="/es/..."` en el cuerpo de una página EN, `link-check` falla.

**Qué se hizo:** además del cruce de idioma, ahora falla cualquier `href="/..."` **dentro del cuerpo**: las rutas internas del contenido deben ser relativas, para que la página siga funcionando en `/es/` y en cualquier subcarpeta.

### 5 · No duplicar contenido entre idiomas
ES debe ser **traducción**, no copia con sinónimos. Google detecta el texto casi idéntico y elige uno de los dos. Consecuencia práctica: el artículo ES no debe ser una versión más corta del EN — mismo cuerpo, mismo dato propio, misma tabla.

### 6 · Keywords por idioma, no keywords traducidas (aplicado)

El plan de [[00 · Plan de keywords (MOC)]] está en español porque el mercado hispanohablante busca distinto:
- EN: `monthly marketing hire`, `WhatsApp chatbot for business`
- ES: `cuánto cuesta un community manager`, `chatbot de WhatsApp para negocios`

Traducir la keyword inglesa produce consultas que nadie escribe.

**Qué se hizo:** se añadió [[07 · English long-tail]], con un cluster propio por servicio en inglés (no una traducción del español) y una tabla de diferencias de intención. Regla operativa: cada keyword apunta a la página de **su** idioma; nunca se cruzan.

### 7 · Metadatos con longitud propia (aplicado)

Dos problemas reales, no teóricos:

1. **Las descripciones se cortaban a 160 caracteres a mitad de frase** (`svc.pageSub.slice(0, 160)`): el resultado terminaba en `"…the message, the"`. Un snippet truncado a mitad de palabra baja el CTR aunque la posición sea buena.
2. **Los títulos de servicio eran traducciones literales y sin marca**: `Marketing — monthly hire from $597/mo` ↔ `Marketing — hire mensual desde $597/mes`.

**Qué se hizo:** cada servicio tiene ahora `metaTitle` y `metaDescription` **escritos a mano en cada idioma**, dentro de `hire-data.js` / `hire-data-es.js` (fuente única), y `build-hire-pages.mjs` los usa con fallback al template.

| Página | EN | ES |
|---|---|---|
| marketing | Marketing monthly hire — $597/mo \| Jacques Hauzeur | Marketing mensual para tu negocio \| Jacques Hauzeur |
| chatbots | WhatsApp chatbots that book and qualify — Jacques Hauzeur | Chatbots de WhatsApp que agendan \| Jacques Hauzeur |
| ai | AI automation for your business — Jacques Hauzeur | Automatizar con IA en tu negocio \| Jacques Hauzeur |

Todos ≤60 caracteres de título y ≤160 de descripción, verificados por `seo-check`.

### 8 · El JSON-LD debe declarar el idioma de la página (verificado)

`inLanguage` lo emite `apply-seo.mjs` por página, pero nada impedía que alguien copiara un bloque de EN a ES y dejara el `@id` apuntando a la URL inglesa.

**Qué se hizo:** `seo-check.mjs` ahora falla si:
- un nodo declara un `inLanguage` distinto al idioma de la página,
- un `@id` propio no cuelga del `canonical` de esa página (las entidades compartidas `#organization`, `#person`, `#website`, `#logo` quedan exentas).

Resultado en `es/marketing.html`: `WebSite`, `WebPage` y `Service` declaran `inLanguage: "es"` y sus `@id` cuelgan de `https://soyjacqueshauzeur.dev/es/marketing.html`.

### 9 · Cuando entre el ruso
`LOCALES.ru.available = false` hoy. Para activarlo:
1. Crear `/ru/` con las mismas 15 páginas (mismo grafo, mismo slug).
2. `available: true` en `tools/locales.mjs` — con eso el flag, `hreflang`, `sitemap` y `llms.txt` se actualizan solos.
3. Rellenar la copia de `site-shell.mjs` (nav/footer) y `hire-data-ru.js`.
4. Correr la secuencia completa y `link-check` debe seguir en PASS: si alguna página RU queda huérfana, lo dice.

> [!warning] No activar RU con páginas a medias
> Un `hreflang="ru"` que apunta a una home en inglés es exactamente el error que acabamos de corregir. Hasta que `/ru/` exista entero, `available: false` y el idioma no aparece.

### 10 · Lo que el checker vigila por ti
`node tools/link-check.mjs` falla si:
- una página EN enlaza a una ES (o al revés) desde el cuerpo,
- una URL indexable queda huérfana de su par de idioma,
- se repite un ancla genérica en los dos idiomas.

## Checklist para una página nueva bilingüe

- [ ] Mismo nombre de archivo en los dos idiomas (salvo excepción documentada).
- [ ] Contenido traducido, no calcado; mismo dato propio.
- [ ] `title` y `description` escritos por separado (≤60 / ≤160).
- [ ] Anclas traducidas; nada de "leer más" ni "clic aquí".
- [ ] Sin enlaces del cuerpo al otro idioma.
- [ ] Imagen compartida (una sola copia en `assets/`).
- [ ] `node tools/apply-seo.mjs && node tools/build-sitemap.mjs && node tools/link-check.mjs`.
- [ ] `node tools/i18n-sync-check.mjs` en PASS (estructura e imágenes coinciden).

## Referencias
- [[01 · Reglas de enlazado]] — regla 8 completa.
- [[00 · Índice interlink]] — el grafo que se replica por idioma.
- [[00 · Plan de keywords (MOC)]] — keywords por idioma, no traducidas.
