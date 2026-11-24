---
title: "Pendientes"
tipo: pendientes
tags: [pendientes]
---

# ⏳ Pendientes

Lo que **no** se puede resolver desde el repositorio o necesita una decisión tuya. Todo lo demás (enlazado, FAQ, hreflang, limpieza, metadatos) ya está hecho y verificado — ver [[resumen]].

## 1 · Redirect de `www` y `http` (consola, 5 min)

`http://soyjacqueshauzeur.dev/` y `https://www.soyjacqueshauzeur.dev/` responden **200 sin redirigir**. El `canonical` lo mitiga, pero no sustituye a un 301.

1. GitHub → repo → **Settings → Pages** → marcar **Enforce HTTPS**.
2. DNS: registro `www` como `CNAME` a `soyjacqueshauzeur.dev`.
3. Verificar:

```bash
curl -sI http://soyjacqueshauzeur.dev/      | head -1   # esperado 301
curl -sI https://www.soyjacqueshauzeur.dev/ | head -1   # esperado 301
```

## 2 · Páginas legales

`privacy.html` + `es/privacidad.html` y `imprint.html` + `es/aviso-legal.html`.

- **No se generaron a propósito**: una política de privacidad debe describir lo que el sitio hace de verdad (WhatsApp, Google Calendar, AdSense).
- El footer ya **no** enlaza a `href="#"`: `site-shell.mjs` comprueba con `existsSync` y las añade solo cuando existan, en su idioma y con la ruta relativa correcta.
- Son necesarias si se activa AdSense.

## 3 · `gallery.html`

Demo de estudio fotográfico, `noindex`, sin enlaces entrantes y con 12 `href="#"`. No entra en el crawl de contenido, pero es un residuo.

- **Decisión pendiente:** borrarla o dejarla como demo.

## 4 · Contenido y enlaces

No son tareas técnicas: son el trabajo de los próximos 3 meses.

- 20–30 artículos long-tail → [[Plan de posicionamiento]]
- 10–20 backlinks de clientes → [[Plan de posicionamiento]]

## 5 · Revisiones periódicas

| Cuándo | Qué |
|---|---|
| Cada deploy | `link-check` · `seo-check` · `i18n-sync-check` · `img-check` en PASS |
| Cada mes | Search Console: consultas nuevas, páginas en posición 8–20, CTR |
| Cada 3 meses | Reevaluar el nombre de las URLs en `/es/` (ver [[Idiomas]]) |

## 6 · Decisión aparcada: nombres de archivo en `/es/`

Hoy 11 de 12 páginas ES usan nombre inglés (`clients.html`, `services.html`) y una española (`sesiones.html`). Es coherente en la práctica porque el nombre es el mismo en los dos idiomas, salvo `sessions/sesiones`.

**No se renombra ahora:** sin 301 disponible en GitHub Pages, el coste (stubs, deuda en Search Console, 20 URLs) supera el beneficio, que es solo estético. Se decide cuando haya 300+ impresiones/mes. Detalle en [[Idiomas]].
