---
title: "Blog (listado)"
url: /blog.html
url_es: /es/blog.html
tipo: hub
cluster: contenido
tags: [il/hub]
---

# 📓 Blog — listado
`/blog.html` · `/es/blog.html` · tipo: **hub de contenido**

> [!info] Rol
> Reparte autoridad hacia todos los artículos y conecta el contenido con la oferta. Hoy es una caja negra: `#blog-grid` está vacío en el HTML y se rellena por JS.

## Enlaces salientes (obligatorios)

| Destino | Ancla sugerida | Ubicación |
|---|---|---|
| [[chat-marketing]] | chat marketing con ManyChat y n8n | grid (estático) |
| [[ia-en-el-trabajo]] | la IA en el trabajo | grid (estático) |
| [[ia-vida-moderna]] | la IA en la vida moderna | grid (estático) |
| [[webs-2026]] | por qué necesitas una web en 2026 | grid (estático) |
| [[services]] | contratar el servicio | CTA medio |
| [[sessions]] | resolverlo en una sesión | CTA final |

## Enlaces entrantes
[[home]] · [[services]] · [[sessions]] · todos los artículos (breadcrumb "blog").

## Cambios en la web

1. **Crítico:** renderizar las tarjetas del listado en HTML estático (el JS puede seguir filtrando, pero los enlaces deben estar en el HTML inicial).
2. Quitar el copy de fotografía: el `meta description` habla de "light, colour and process" y el CTA invita a "photographers, retouchers, and producers". No tiene nada que ver con el sitio.
3. Convertir las categorías (`ads`, `ai`, `chatbots`, `marketing`, `negocios`, `tecnologia`, `web`) en **páginas de categoría indexables** en lugar de filtros JS: eso crea hubs temáticos reales.
4. Corregir el mezclado de idioma: en la versión EN los filtros dicen `negocios` y `tecnologia`.
