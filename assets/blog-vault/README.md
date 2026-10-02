# Vault de Obsidian — Blog SoyJacquesHauzeur

Este es el vault de Obsidian para escribir, vincular y mantener el blog **bilingüe (EN/ES)** de SoyJacquesHauzeur.

## Cómo abrirlo
1. Abre Obsidian → **Open folder as vault** → selecciona esta carpeta: `assets/blog-vault/`.
2. Empieza por [[Blog]] (el índice / MOC con todas las notas).

## Estructura
```
assets/blog-vault/
├── Blog.md                    ← índice (MOC): todas las notas, por año/mes
├── _templates/
│   └── Blog post.md           ← plantilla de nota (estructura de blog-t.html)
├── blog/
│   └── <año>/<mes>/<slug>.md  ← una nota por artículo (espeja la web)
└── .obsidian/                 ← configuración del vault
```

## Convenciones
- **Una nota por artículo**, mismo `slug` que la web. Ruta espejo: `blog/<año>/<mes>/<slug>.md`.
- **Interlinks** (notas relacionadas) con wikilinks: `[[slug]]`.
- **Outlinks** (fuentes / bibliografía) como enlaces markdown externos.
- **Tags** en el frontmatter (`tags: [...]`) → aparecen en el panel de tags de Obsidian.
- **Donde antes decía “Del archivo”**, ahora van los canales propios: `telegram`, `youtube` y `meet` (agenda con Google Meet).

## Referente de escritura
La estructura y el flujo de un post salen del generador:
[blog-t.html](http://localhost:8080/blog-t.html) (herramienta interna, `noindex`).
La plantilla [[Blog post]] replica sus secciones **1 · Contenido, 2 · Imagen, 3 · Taxonomía, 4 · Meta** (el punto 5 —temas relacionados— ya no existe aquí: los relacionados se crean en Obsidian con wikilinks).

## Publicar
Cuando una nota esté lista, se escribe el artículo en la web siguiendo la estructura de `AGENTS.md` (sección Blog) y se registra en `assets/js/blog-data*.js`.
