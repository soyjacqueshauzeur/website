---
title: "Ejecución SEO — plan de trabajo"
tipo: plan-moc
tags: [plan, seo, moc]
---

# 🚧 Ejecución SEO — plan de trabajo

Estado de los arreglos de la auditoría de Search Console. Cada nota tiene el problema, la decisión tomada y cómo se verifica.

## Semana 1 · quitar el freno (hecho)

| # | Arreglo | Nota | Estado |
|---|---|---|---|
| 1 | Enlazar home y servicios a las 6 páginas de servicio | [[00 · Índice interlink]] | ✅ aplicado |
| 2 | Listado del blog en HTML estático + posts enlazados | [[01 · Reglas de enlazado]] | ✅ aplicado |
| 3 | Borrar el copy de fotografía y `sparrow` | [[05 · Cambios aplicados]] | ✅ aplicado |
| 4a | `hreflang` de ruso | [[02 · G — hreflang de ruso falso]] | ✅ aplicado |
| 4b | FAQPage sin contenido visible | [[01 · F — FAQPage sin contenido visible]] | ✅ aplicado |
| 5 | Redirect de `www` y `http` | [[03 · H — duplicados de host]] | ⏳ requiere consola |

## Reglas de enlazado verificadas por máquina

`node tools/link-check.mjs` comprueba y **falla el build** si se rompen:

- regla 3 · Cantidad (≥3 entrantes, ≥1 de nivel superior, ≤3 clics, ≥3 salientes)
- regla 4 · Anclas (prohibidas, vacías, ambiguas, sobre-optimizadas)
- regla 6 · Ninguna página indexable enlaza a una `noindex`
- regla 7 · Simetría de clusters
- regla 8 · Ningún enlace del cuerpo cruza de idioma

## Después de la semana 1

- [[06 · Diagnóstico y plan de posicionamiento]] — qué hacer cuando la web ya está sana y aún no hay visitas: diagnóstico en Search Console, los tres motores y plan de 12 semanas.
- [[04 · Roadmap 90 días]] — versión resumida: contenido, enlaces y expectativas.

## Comandos

```
node tools/apply-interlink.mjs    # enlaces internos estáticos
node tools/apply-seo.mjs          # canonical, hreflang, JSON-LD
node tools/build-sitemap.mjs      # sitemap + robots
node tools/link-check.mjs         # reglas 3, 4, 6, 7, 8
node tools/i18n-sync-check.mjs    # paridad EN/ES
node tools/seo-check.mjs          # canónica/JSON-LD/hreflang
```
