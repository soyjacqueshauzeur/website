---
title: "Índice — soyjacqueshauzeur.dev"
tipo: indice
tags: [indice, moc, seo]
---
- [ ] 
# 🗂️ Índice del vault

Mapa de **la web** y de **las notas**. Si no sabes por dónde empezar: [[resumen]] (qué se hizo) → [[Plan de posicionamiento]] (qué toca ahora).

- Cómo abrir y usar el vault: [[README]]
- Qué se arregló y en qué estado quedó: [[resumen]]
- Qué falta: [[Pendientes]]

---

## 1 · Arquitectura SEO de la web

**30 URLs indexables** (15 EN + 15 ES), todas a ≤ 2 clics de la home.

```
                        ┌───────────────┐
                        │   [[home]]    │  /  ·  /es/
                        └───────┬───────┘
        ┌──────────┬────────────┼──────────┬─────────────┐
        ▼          ▼            ▼          ▼             ▼
  [[services]] [[clients]]  [[sessions]] [[blog-listing]] 6 servicios
    (hub)      (prueba)       (1:1)        (contenido)     directos
        │          │            │          │
        ▼          ▼            ▼          ▼
  6 servicios  6 servicios   6 enlaces   4 artículos
```

| Nivel | Qué es | Notas | Función SEO |
|---|---|---|---|
| **0** | Home | [[home]] | Reparte autoridad a todo |
| **1** | Hubs | [[services]] · [[clients]] · [[sessions]] · [[blog-listing]] | Concentran y distribuyen |
| **2** | Servicios | [[marketing]] · [[campaigns]] · [[chatbots]] · [[ai]] · [[ecommerce]] · [[financial-planning]] | Páginas de dinero |
| **3** | Artículos | [[chat-marketing]] · [[webs-2026]] · [[ia-vida-moderna]] · [[ia-en-el-trabajo]] | Capturan la búsqueda long-tail |

Ver el **estado real medido**: [[04 · Mapa EN]] · [[05 · Mapa ES]]

### Reglas que lo gobiernan

Las 10 reglas están en [[01 · Reglas de enlazado]]; estas cuatro tienen documento propio o están automatizadas:

| Regla | Dónde | Automatizada |
|---|---|---|
| 3 · Cantidad (3+ entrantes, ≤3 clics) | [[01 · Reglas de enlazado]] | ✅ `link-check` |
| 4 · Anclas (sin «clic aquí») | [[01 · Reglas de enlazado]] | ✅ `link-check` |
| 6 · Nada de enlaces a `noindex` | [[01 · Reglas de enlazado]] | ✅ `link-check` |
| 7 · Simetría de clusters | [[01 · Reglas de enlazado]] | ✅ `link-check` |
| 8 · Bilingüe (misma estructura) | [[Idiomas]] | ✅ `link-check` |
| 9 · Qué no hacer | [[02 · Regla 9 — que no hacer]] | ✅ `link-check` |
| 10 · Mantenimiento | [[03 · Regla 10 — mantenimiento]] | manual |

---

## 2 · Estructura de archivos

```
soyjacqueshauzeur-vault/
│
├── index.md .......................... esta nota
├── README.md ......................... cómo abrir el vault y convenciones
├── resumen.md ........................ qué se hizo (auditoría + cambios)
├── Plan de posicionamiento.md ........ plan de 12 semanas: contenido y enlaces
├── Pendientes.md ..................... lo que no se resuelve desde el repo
├── Idiomas.md ........................ regla bilingüe EN/ES y estado auditado
├── Blog.md ........................... índice de las notas de artículo
│
├── interlink/
│   ├── 00 · Índice interlink ......... mapa por página (obligaciones)
│   ├── 01 · Reglas de enlazado ....... las 10 reglas
│   ├── 02 · Regla 9 — que no hacer .. qué evitar y cómo se detecta
│   ├── 03 · Regla 10 ................ añadir una página nueva
│   ├── 04 · Mapa EN .................. la web EN, generada del HTML
│   ├── 05 · Mapa ES .................. la web ES, generada del HTML
│   └── paginas/ ...................... 11 notas: una por página
│
├── keywords/
│   ├── 00 · Plan de keywords (MOC) ... estrategia y orden de ataque
│   ├── 01…06 ......................... un cluster por servicio (ES)
│   └── 07 · English long-tail ........ clusters en inglés
│
├── blog/<año>/<mes>/<slug>.md ........ una nota por artículo
├── _templates/Blog post.md ........... plantilla de artículo
└── Backend de pagos (MercadoPago).md . notas técnicas sueltas
```

---

## 3 · Cómo se relacionan las notas

### Documentación → trabajo

```
[[resumen]] ──────────────► qué pasó
    │
    ├─► [[Pendientes]] ───► qué falta (3 tareas fuera del repo)
    │
    └─► [[Plan de posicionamiento]] ─► qué hacer (12 semanas)
             │
             ├─► [[00 · Plan de keywords (MOC)]] ─► qué escribir
             │        ├─► [[01 · Marketing]] … [[06 · Finanzas]]
             │        └─► [[07 · English long-tail]]
             │
             └─► [[04 · Mapa EN]] / [[05 · Mapa ES]] ─► dónde enlazarlo
```

### Enlazado → páginas

```
[[00 · Índice interlink]] ──► las 11 notas de página
        │
        ├─► [[01 · Reglas de enlazado]] ──► las 10 reglas
        ├─► [[02 · Regla 9 — que no hacer]]
        ├─► [[03 · Regla 10 — mantenimiento]]
        ├─► [[04 · Mapa EN]] ──┐
        └─► [[05 · Mapa ES]] ──┴─► mismas 11 notas + 4 artículos
```

### Contenido → idioma

```
[[Blog]] ──► [[chat-marketing]] ──┬─► [[chatbots]]   (servicio que soporta)
                                  └─► [[blog-listing]]
[[Idiomas]] ──► regla 8: misma estructura, misma URL relativa, ancla traducida
```

### Tabla de relaciones

| Nota | Para qué sirve | Enlaza a | La enlazan |
|---|---|---|---|
| [[index]] | entrar | todo | — |
| [[README]] | abrir el vault | [[resumen]], mapas | [[index]] |
| [[resumen]] | qué se hizo | [[Pendientes]], [[Plan de posicionamiento]] | [[index]], [[README]] |
| [[Pendientes]] | qué falta | [[Plan de posicionamiento]], [[Idiomas]] | [[resumen]] |
| [[Plan de posicionamiento]] | qué hacer | keywords, mapas, [[Pendientes]] | [[index]], [[resumen]] |
| [[youtube]] | vídeos: inventario y qué aportan al SEO | [[chat-marketing]], [[Plan de posicionamiento]] | [[index]] |
| [[Idiomas]] | bilingüe | [[04 · Mapa EN]] · [[05 · Mapa ES]] | [[index]], [[resumen]], [[Pendientes]] |
| [[Blog]] | índice de artículos | las 4 notas de blog | [[index]] |
| [[00 · Índice interlink]] | obligaciones por página | reglas, mapas, 11 páginas | [[index]], [[README]] |
| [[01 · Reglas de enlazado]] | las 10 reglas | [[02 · Regla 9 — que no hacer|regla 9]], [[03 · Regla 10 — mantenimiento|regla 10]] | interlink, keywords, páginas |
| [[04 · Mapa EN]] · [[05 · Mapa ES]] | estado real | 11 páginas + 4 artículos | [[index]], [[Idiomas]] |
| `paginas/*` | una página | su hub, hermanos, artículos | mapa, índice, otras páginas |
| `keywords/*` | qué escribir | su servicio | [[00 · Plan de keywords (MOC)]] |

---

## 4 · Qué nota abrir según la tarea

| Si vas a… | Abre |
|---|---|
| Escribir un artículo | [[00 · Plan de keywords (MOC)]] → su cluster → [[Blog post]] |
| Publicar una página nueva | [[03 · Regla 10 — mantenimiento]] |
| Revisar o añadir enlaces | [[01 · Reglas de enlazado]] + [[04 · Mapa EN]] / [[05 · Mapa ES]] |
| Trabajar con los vídeos | [[youtube]] |
| Entender por qué el sitio es así | [[resumen]] |
| Saber qué hacer este mes | [[Plan de posicionamiento]] |
| Tocar algo bilingüe | [[Idiomas]] |
| Ver lo que no se puede hacer aquí | [[Pendientes]] |
| Trabajar en pagos | [[Backend de pagos (MercadoPago)]] |

---

## 5 · El grafo

`Ctrl/Cmd + G`. Filtro y colores ya configurados en `.obsidian/graph.json`:

| Color | Tipo | Tag |
|---|---|---|
| Lima | índice / raíz | `#indice` · `#il/raiz` |
| Azul | hubs | `#il/hub` |
| Ámbar | servicios | `#il/servicio` |
| Verde | artículos | `#il/post` |
| Violeta | reglas | `#il/reglas` |
| Azul claro | mapa EN | `#mapa/en` |
| Salmón | mapa ES | `#mapa/es` |

Para ver **solo la web en inglés**: en el buscador del grafo, `path:interlink/04`.
Para ver **solo un cluster de servicios**: `path:interlink/paginas` y arrastra un nodo.

---

## 6 · Mantenimiento de este vault

| Comando | Qué hace |
|---|---|
| `node tools/vault-maps.mjs` | regenera [[04 · Mapa EN]] y [[05 · Mapa ES]] desde el HTML |
| `node tools/link-check.mjs` | verifica las reglas 3, 4, 6, 7, 8, 9 |
| `node tools/seo-check.mjs` | canonical, hreflang, JSON-LD |
| `node tools/i18n-sync-check.mjs` | paridad EN/ES |

Los mapas **no se editan a mano**: si el sitio cambia, se regeneran. El resto de notas sí son de escritura manual.
