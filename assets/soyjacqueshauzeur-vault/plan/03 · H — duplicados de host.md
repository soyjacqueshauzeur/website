---
title: "H — duplicados de host"
tipo: plan
tags: [plan, seo, pendiente]
---

# 🌐 H · Duplicados de host (`http://` y `www.`)

## El problema
```
http://soyjacqueshauzeur.dev/          → 200 (sin redirect)
https://soyjacqueshauzeur.dev/         → 200
https://www.soyjacqueshauzeur.dev/     → 200 (sin redirect)
```
Cuatro variantes de la misma home. Google elige una (el `canonical` ayuda), pero reparte señales entre URLs que deberían ser una sola y puede tardar meses en consolidar.

## Lo que sí se arregla en el repo (hecho)
- `canonical` autorreferente y absoluto en las 30 páginas → `apply-seo.mjs`.
- `hreflang` absoluto y recíproco → ya no hay variantes relativas.
- Sitemap y `robots.txt` con el dominio canónico (`tools/seo.mjs`: `SITE`), sin `www`.
- `CNAME` con `soyjacqueshauzeur.dev`.

Eso es todo lo que se puede hacer **desde el código**: un sitio estático en GitHub Pages no puede emitir un 301.

## Lo que hay que hacer en la consola (pendiente)

### 1 · Forzar HTTPS (2 minutos)
1. GitHub → repo → **Settings → Pages**.
2. Comprobar que el dominio personalizado es `soyjacqueshauzeur.dev`.
3. Marcar **Enforce HTTPS**.

Resultado esperado: `http://` → 301 → `https://`.

### 2 · Redirigir `www` al dominio raíz
GitHub Pages **no** redirige `www` solo. Dos opciones:

**Opción A — DNS (la más limpia, sin coste):**
- En el proveedor DNS, cambiar el registro de `www` por un `CNAME` a `soyjacqueshauzeur.dev`.
- Si el proveedor no permite CNAME a apex (algunos no), usar un **redirect rule** del proveedor si existe.

**Opción B — Cloudflare (si algún día se pone delante):**
- Regla de redirección: `www.soyjacqueshauzeur.dev/*` → `https://soyjacqueshauzeur.dev/$1`, 301.

### 3 · Verificar
```bash
curl -sI http://soyjacqueshauzeur.dev/      | head -1   # esperado: 301
curl -sI https://www.soyjacqueshauzeur.dev/ | head -1   # esperado: 301
curl -sI https://soyjacqueshauzeur.dev/     | head -1   # esperado: 200
```

## Por qué no basta con el canonical
El `canonical` es una **sugerencia**, no una orden: Google puede ignorarla si detecta inconsistencias. Un 301 es una señal dura y transfiere el 100% de la autoridad. Con un dominio nuevo y cero enlaces, cada gramo de señal cuenta — no conviene regalarlo a una variante con `www`.

## Estado
⬜ Pendiente de consola (no se puede resolver en el repo).
Relacionado: [[00 · Ejecución SEO (MOC)]] · [[01 · Reglas de enlazado]].
