---
title: "G — hreflang de ruso falso"
tipo: plan
tags: [plan, seo, resuelto]
---

# 🇷🇺 G · `hreflang="ru"` apuntando a la home inglesa

## El problema
Cada página declaraba en el nav:

```html
<a class="flag lang-flag" href="/" hreflang="ru" lang="ru" data-lang="ru" title="Русский">
```

Traducción: *«la versión rusa de esta página es la home en inglés»*. Google recibe una señal contradictoria en el sitio entero: 30 páginas diciendo que el inglés es el ruso.

Consecuencias: `hreflang` inválido, dilución de la señal de idioma y una bandera que lleva a la home en otro idioma.

## La causa
`tools/site-shell.mjs` renderizaba **todos** los idiomas de `LANG_ORDER` sin preguntar si existían:

```js
return LANG_ORDER.map((k) => flag(asset, lang, page, k)).join('\n');
```

`LOCALES.ru.available` ya era `false`, pero el flag se pintaba igual. La bandera mentía porque el registro decía la verdad y el generador no la leía.

## La solución

```js
function langSwitch(asset, lang, page) {
  // Solo los idiomas realmente publicados
  return LANG_ORDER.filter((k) => locale(k).available)
    .map((k) => flag(asset, lang, page, k)).join('\n');
}
```

Una línea. Ahora el idioma solo aparece cuando existe, y no hay que recordar quitarlo del HTML a mano.

## Verificación
- `grep -r 'hreflang="ru"' --include=*.html .` → **0 resultados**.
- `seo-check` valida `hreflang` recíproco EN/ES/x-default → PASS.
- El nav muestra US/CO; la bandera RU desaparece.

## Cómo se reactiva el ruso (sin repetir el error)
1. Crear `/ru/` completo (mismas 15 páginas, mismo grafo).
2. Poner `available: true` en `tools/locales.mjs`.
3. Rellenar nav/footer de `ru` en `site-shell.mjs` y `hire-data-ru.js`.
4. `node tools/apply-nav.mjs && node tools/build-hire-pages.mjs && node tools/apply-seo.mjs && node tools/build-sitemap.mjs`.
5. `node tools/link-check.mjs` — si alguna página RU queda huérfana, falla.

> [!note] Regla
> El `hreflang` nunca se escribe a mano. Lo derivan `site-shell.mjs` (flag) y `apply-seo.mjs` (`<link rel="alternate">`).
