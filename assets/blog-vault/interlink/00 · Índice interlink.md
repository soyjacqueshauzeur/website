---
title: "Interlink — Mapa de enlazado interno de la web"
tipo: indice
tags: [il/indice, moc, seo]
reference: http://localhost:8080/
---

# 🕸️ Interlink — estructura de enlaces internos

Mapa de **qué debe enlazar a qué** en `soyjacqueshauzeur.dev`. Una nota por página del sitio. Los enlaces son wikilinks reales, así que el **grafo de Obsidian dibuja la estructura**: abre `Ctrl/Cmd + G` (Graph view) y filtra `path:interlink` si quieres aislarlo.

- Reglas que gobiernan el grafo: [[01 · Reglas de enlazado]]
- Este mapa es el **objetivo**. El estado real de la web (con sus fallos) está al final: [[00 · Índice interlink#Estado real vs objetivo|Estado real vs objetivo]].

---

## Nodos

### Nivel 0 · Raíz
- [[home]] — `/` · `/es/`

### Nivel 1 · Hubs de sección
- [[services]] — `/services.html` · hub comercial
- [[clients]] — `/clients.html` · prueba social
- [[sessions]] — `/sessions.html` · 1:1
- [[blog-listing]] — `/blog.html` · contenido

### Nivel 2 · Servicios (páginas de dinero)
- [[marketing]] — `/marketing.html`
- [[ai]] — `/ai.html`
- [[chatbots]] — `/chatbots.html`
- [[campaigns]] — `/campaigns.html`
- [[ecommerce]] — `/ecommerce.html`
- [[financial-planning]] — `/financial-planning.html`

### Nivel 3 · Artículos
- [[chat-marketing]] → soporta [[chatbots]]
- [[ia-en-el-trabajo]] → soporta [[ai]]
- [[ia-vida-moderna]] → soporta [[ai]]
- [[webs-2026]] → soporta [[services]]

---

## Diagrama

```
                        ┌──────────────┐
                        │   [[home]]   │
                        └──────┬───────┘
        ┌──────────────┬───────┼────────┬──────────────┐
        ▼              ▼       ▼        ▼              ▼
  [[services]]   [[clients]] [[sessions]] [[blog-listing]]
        │              │       │        │
        │              │       │        ▼
        ▼              │       │   4 artículos
  ┌─────┴──────┐       │       │   (nivel 3)
  ▼ ▼ ▼ ▼ ▼ ▼  │       │       │
 marketing      │       │       │
 ai             │       │       │
 chatbots ──────┘───────┘───────┘
 campaigns
 ecommerce
 financial-planning
```

Cada servicio recibe enlaces de: **home**, **services**, **clients** (por tag), **sessions** (los más pedidos), sus **2 hermanos** del cluster y **1–2 artículos**.

---

## Clusters semánticos

| Cluster | Servicios | Artículo de apoyo |
|---|---|---|
| Adquisición | [[marketing]] ↔ [[campaigns]] | — |
| Automatización | [[ai]] ↔ [[chatbots]] | [[chat-marketing]], [[ia-en-el-trabajo]] |
| Comercio | [[ecommerce]] ↔ [[marketing]] | [[webs-2026]] |
| Dinero | [[financial-planning]] ↔ [[ecommerce]] | — |

Los clusters son la base del **cross-sell**: dentro de un cluster siempre hay enlaces cruzados en ambos sentidos.

---

## Cómo verlo gráficamente

1. Abre el vault en Obsidian (`Open folder as vault` → `assets/blog-vault/`).
2. `Ctrl/Cmd + G` → **Graph view**.
3. En el filtro del grafo escribe: `path:interlink OR path:blog`
4. Activa **Arrows** (flechas) para ver la dirección de cada enlace.
5. Para ver solo un cluster: `path:interlink/paginas` y arrastra un nodo.

> [!tip] Grupos de color
> Ya están configurados en `.obsidian/graph.json`: lima = raíz, azul = hubs, ámbar = servicios, verde = artículos, violeta = reglas. Si Obsidian estaba abierto al crearse, ciérralo y vuelve a abrir para que cargue los grupos.

---

## Estado real vs objetivo

Lo que hay hoy en la web (medido en el repo), que es la razón por la que el grafo no se cumple:

| Página | Enlaces internos entrantes hoy | Debería tener |
|---|---|---|
| [[home]] | *todas* | — |
| [[services]] | nav + [[home]] | + los 6 servicios, + blog |
| [[marketing]] | **solo desde `404.html`** ⚠️ | home, hub, clientes, 1:1, hermanos, post |
| [[ai]] | **solo desde `404.html`** ⚠️ | idem |
| [[chatbots]] | **0 — huérfana** ⚠️ | idem |
| [[campaigns]] | **0 — huérfana** ⚠️ | idem |
| [[ecommerce]] | **0 — huérfana** ⚠️ | idem |
| [[financial-planning]] | **0 — huérfana** ⚠️ | idem |
| [[clients]] | nav | + hubs, + servicios por tag |
| [[sessions]] | nav | + servicios, + blog |
| [[blog-listing]] | nav | + home, + hub |
| [[chat-marketing]] | **0** ⚠️ | listing, servicio, hermanos |
| [[ia-vida-moderna]] | **0** ⚠️ | idem |
| [[webs-2026]] | **0** ⚠️ | idem |
| [[ia-en-el-trabajo]] | solo desde `blog.html` (destacado) | idem |

Además: `services.html` enlaza a las páginas `*-hire.html`, que son **noindex** — enlaces que no pasan autoridad a ninguna parte.

---

## Checklist de implementación

- [ ] Enlazar [[home]] → los 6 servicios (tarjetas estáticas, no solo el hub).
- [ ] Enlazar [[services]] → los 6 servicios (sustituir los `*-hire.html`).
- [ ] Renderizar el listado del blog en HTML estático (hoy `#blog-grid` se llena por JS → el crawler no ve los enlaces).
- [ ] Añadir bloque "servicios relacionados" en cada página de servicio (hermanos del cluster).
- [ ] Enlazar desde [[clients]] cada tag de servicio a su página de servicio.
- [ ] Enlazar desde cada artículo a su servicio + al listado.
- [ ] Añadir enlaces contextuales del hub y de [[sessions]] a los artículos.
- [ ] Verificar que ninguna URL del sitemap queda con menos de 3 enlaces entrantes.
- [ ] Replicar todo en `/es/` con los anchors traducidos.
- [ ] `node tools/seo-check.mjs` + `node tools/i18n-sync-check.mjs` en PASS.
