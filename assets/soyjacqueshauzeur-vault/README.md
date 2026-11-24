---
title: "README — cómo funciona este vault"
tags: [readme, moc]
---

# 📚 Vault de SoyJacquesHauzeur

Todo lo que hay que saber sobre **`soyjacqueshauzeur.dev`**: cómo está construida la web, cómo se escriben los artículos, cómo se enlazan las páginas y qué falta.

> [!tip] Empezar aquí
> **[[index]]** — el índice general: arquitectura SEO, archivos y cómo se relacionan.
> **[[resumen]]** — qué se hizo y en qué estado quedó el sitio.
> **[[04 · Mapa EN]]** / **[[05 · Mapa ES]]** — cómo quedó la web, página por página.
> **[[Plan de posicionamiento]]** — qué hacer ahora que no hay visitas.

## Cómo abrirlo

1. Obsidian → **Open folder as vault** → `assets/soyjacqueshauzeur-vault/`.
2. `Ctrl/Cmd + G` para el grafo. Ya viene configurado: filtro, flechas y colores por tipo.
3. `Ctrl/Cmd + O` para buscar cualquier nota por nombre.

## Estructura

```
soyjacqueshauzeur-vault/
├── resumen.md                    ← qué se hizo (puerta de entrada)
├── Plan de posicionamiento.md    ← plan de 12 semanas (contenido y enlaces)
├── Pendientes.md                 ← lo que no se resuelve desde el repo
├── Idiomas.md                    ← regla bilingüe EN/ES y estado
├── Blog.md                       ← índice de las notas de artículo
├── youtube.md                    ← inventario del canal y qué aporta al SEO
│
├── interlink/                    ← cómo se enlaza la web
│   ├── 00 · Índice interlink     ← mapa y estado por página
│   ├── 01 · Reglas de enlazado   ← las 10 reglas
│   ├── 02 · Regla 9              ← qué no hacer
│   ├── 03 · Regla 10             ← mantenimiento
│   ├── 04 · Mapa EN              ← la web en inglés, generada del HTML
│   ├── 05 · Mapa ES              ← la web en español, generada del HTML
│   └── paginas/                  ← una nota por página (EN y ES a la vez)
│
├── keywords/                     ← qué escribir y para quién
│   ├── 00 · Plan de keywords (MOC)
│   ├── 01…06                     ← un cluster por servicio (ES)
│   └── 07 · English long-tail    ← clusters en inglés
│
├── blog/<año>/<mes>/<slug>.md    ← una nota por artículo (espeja la web)
├── _templates/Blog post.md       ← plantilla de artículo
└── Backend de pagos (MercadoPago).md
```

## Las tres reglas del vault

1. **Una nota = una página** (no un idioma). La nota `marketing` describe `/marketing.html` y `/es/marketing.html`; el frontmatter lleva las dos URLs.
2. **Los mapas se generan, no se escriben a mano.** `node tools/vault-maps.mjs` reescribe `04 · Mapa EN` y `05 · Mapa ES` desde el HTML construido.
3. **Si una nota de este vault contradice el repo, manda el repo.** El repo se verifica con `link-check`; las notas son el mapa, no la fuente.

## Convenciones de las notas

- **Frontmatter**: `title`, `tipo`, `tags`.
- **Wikilinks** `[[nota]]` para lo interno; enlaces markdown para lo externo.
- **Tags por tipo**: `il/*` (interlink), `kw/*` (keywords), `mapa/en`, `mapa/es`.
- **Nombres de archivo con prefijo numérico** (`00 ·`, `01 ·`) para que el orden de lectura sea el del flujo.

## Comandos que mantienen esto verdadero

```bash
node tools/vault-maps.mjs        # regenera los mapas EN/ES
node tools/link-check.mjs        # reglas 3, 4, 6, 7, 8, 9
node tools/seo-check.mjs         # canonical, hreflang, JSON-LD
node tools/i18n-sync-check.mjs   # paridad EN/ES
```

## Referente de escritura

La estructura de un artículo sale de `blog-t.html` (herramienta interna, `noindex`).
La plantilla [[Blog post]] replica sus secciones: **1 · Contenido · 2 · Imagen · 3 · Taxonomía · 4 · Meta**. Los temas relacionados se resuelven con wikilinks.
