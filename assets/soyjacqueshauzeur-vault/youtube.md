---
title: "YouTube — qué aporta al SEO y cómo usarlo"
tipo: plan
tags: [youtube, seo, contenido]
origen: conversación del 4 nov 2026
canal: https://www.youtube.com/@soyjacqueshauzeur
---

# 🎬 YouTube y la web

Respuesta a: *«¿da valor subir una sección con iframes de YouTube para darle contenido nuevo a la web?»*

**Sí aporta, pero no por los iframes.** Un iframe es una ventana a youtube.com: el contenido vive en YouTube y se indexa allí. Para Google, tu página sigue teniendo las mismas palabras que antes.

## Qué aporta y qué no

| Lo que parece que aporta | Realidad |
|---|---|
| «Contenido nuevo» en la página | **0 palabras nuevas.** El iframe no aporta texto indexable |
| Posicionar el vídeo | El vídeo posiciona en YouTube, no en tu web |
| Autoridad | Ninguna: el iframe no transfiere PageRank |
| Tiempo en página | ✅ Mejora el dwell time |
| Conversión / suscriptores | ✅ Sí, y es medible |
| Tráfico cruzado | ✅ YouTube → web y web → YouTube |

Coste: cada embed carga el reproductor de YouTube (~1–2 MB, decenas de peticiones). Sin control, hunde las Core Web Vitals, que sí son factor de ranking.

## Lo que sí convierte vídeo en SEO: la transcripción

El activo no es el vídeo: es **el texto que lo acompaña**.

```
/videos/<slug>.html
├── H1 con la consulta ("Cómo automatizar WhatsApp con n8n")
├── Transcripción limpia (800–1.500 palabras de texto único)
├── Resumen de 3 puntos clave arriba
├── El vídeo embebido (con fachada, ver abajo)
├── Enlaces al artículo y al servicio relacionados
└── JSON-LD VideoObject → puede salir con miniatura en Google
```

Con el canal actual: **27 vídeos ≈ 20.000 palabras de contenido único** atadas a búsquedas reales («cómo…», «tutorial de…»). Eso sí es contenido nuevo, y no hay que grabar nada.

## Cómo hacerlo bien (3 niveles, por orden de retorno)

1. **Embeber en los artículos que ya existen** — 15 min, valor inmediato.
   El vídeo de chatbots dentro de `chat-marketing`; el de IA dentro de `ia-en-el-trabajo`. Relevancia contextual real, sin crear URLs nuevas.
2. **Páginas de vídeo con transcripción** — 1–2 h por vídeo, el que más rinde.
   Solo para los vídeos que responden a una consulta que alguien escribe.
3. **Hub `/videos.html`** — cuando haya 5–8 páginas de vídeo.
   Sin transcripciones detrás, un hub de iframes no vale nada.

## Lo que NO haría

- ❌ **Una galería de iframes.** 20 páginas con solo un reproductor son 20 páginas vacías: diluyen el sitio y Google las ignora. Es el mismo patrón que `gallery.html`, que sigue pendiente de borrar.
- ❌ Un iframe por vídeo sin `loading="lazy"` ni fachada.
- ❌ Transcripciones automáticas sin limpiar (texto ilegible = cero valor).
- ❌ Crear la sección en un idioma y no en el otro: `i18n-sync-check` fallaría.

## Detalles técnicos

**Fachada en vez de iframe:** miniatura de YouTube y el iframe se carga **solo al clic**. Ahorra ~1,5 MB por vídeo y no toca el LCP.

```html
<button class="video-facade" data-video="ID" aria-label="Reproducir: título">
  <img src="https://i.ytimg.com/vi/ID/maxresdefault.jpg" width="1280" height="720" alt="…" loading="lazy">
</button>
<!-- el <iframe> se inyecta al clic, con title, loading=lazy y youtube-nocookie -->
```

**VideoObject** (lo que da la miniatura en los resultados):

```json
{
  "@type": "VideoObject",
  "name": "…",
  "description": "…",
  "thumbnailUrl": "https://i.ytimg.com/vi/ID/maxresdefault.jpg",
  "uploadDate": "2026-10-02",
  "embedUrl": "https://www.youtube-nocookie.com/embed/ID",
  "duration": "PT8M12S"
}
```

Encaja con las reglas del sitio: 3 enlaces entrantes (regla 3), simetría de idioma (regla 8), anclas descriptivas (regla 4) y `link-check` verificándolo.

---

# Inventario del canal (leído del canal público)

**164 suscriptores · 28 vídeos** (27 visibles en la pestaña Videos).

## Serie A · Tutorial de chatbot para WhatsApp con Landbot (#01–#16)

16 episodios. **Es el activo más valioso del canal para SEO**: una serie completa, paso a paso, que responde a «tutorial chatbot WhatsApp» mejor que cualquier artículo suelto.

| # | ID | Título |
|---|---|---|
| 01 | `ts0C0ApSiS8` | Tutorial para crear un chatbot para WhatsApp con Landbot |
| 02 | `B6NIe3tEpFs` | … #02 |
| 03 | `7NsEJf9Rdhc` | … #03 |
| 04 | `m_X-2pgXsMs` | … #04 |
| 05 | `5M_-CmoTdVw` | … #05 |
| 06 | `rHnmrXN_WMA` | … #06 |
| 07 | `VuIxUrlSEfI` | … #07 |
| 08 | `1Bk6n9up1HA` | … #08 |
| 09 | `bwNWXZCzN1Y` | … #09 |
| 10 | `cAOB98J0Kao` | … #10 |
| 11 | `SW_rpIDFOQc` | … #11 |
| 12 | `efqiDpf6Plc` | … #12 |
| 13 | `oSbyOu4aXu8` | … #13 |
| 14 | `ACl65xxGrrc` | … #14 |
| 15 | `ucQhlMpannQ` | … #15 |
| 16 | `2DLqSesYgPc` | … #16 |

**Idea:** una **guía pilar** en el blog («Cómo crear un chatbot de WhatsApp paso a paso») que embeba la serie y tenga la transcripción de los 3 episodios clave. Una sola URL fuerte en vez de 16 débiles.

## Serie B · Trucos de ManyChat (7 vídeos)

| ID | Título |
|---|---|
| `PC0Vi3R1u6c` | Qué es el Guest mode en ManyChat |
| `cffFLMF5zog` | Respuestas ManyChat — botones y tags en Google Sheets |
| `TLrFF0_7sTs` | Branding y diseño para ManyChat |
| `xbmbagrlF1A` | Crea secuencias lógicas para medir acciones en ManyChat |
| `yhcOUOZRrRw` | Verificación de pagos con QR, links y subida de comprobantes |
| `x9tE13Q744g` | ManyChat: medir interacción de usuarios por días |
| `4Lfa5bBZgc4` | Crear en ManyChat un login para clientes |

**Idea:** cada uno es una consulta long-tail exacta («manychat login para clientes», «manychat google sheets»). Páginas cortas con transcripción, no un hub.

## Serie C · Negocio y casos

| ID | Título |
|---|---|
| `Ew2Y55oSGjw` | Utiliza un chatbot para que trabaje y facture en tu negocio 24/7 |
| `tC6enBKgaiU` | Testimonio Johanna Sánchez — Amazon FBA |
| `txlHx2pwi4s` | 12 minutos para vender en Hotmart, marketing de afiliados y negocios físicos |
| `56c6WeLmF2I` | Perfil superproof |

`Ew2Y55oSGjw` **ya está enlazado** desde el artículo de chat marketing. Es el candidato natural para la primera página de vídeo con transcripción.

---

# Plan propuesto

## Fase 1 · Embeds contextuales (1 tarde)

- [ ] `chat-marketing.html` (EN + ES) → embed de `Ew2Y55oSGjw` en el primer tercio.
- [ ] `paginas-web-con-ia.html` → embed del vídeo de IA (si existe uno adecuado).
- [ ] Fachada + `loading="lazy"`; nunca el iframe directo.
- [ ] Texto de apoyo alrededor: el embed no sustituye al párrafo.

## Fase 2 · Primera página de vídeo (1–2 h)

- [ ] `/blog/2026/11/chatbot-whatsapp-paso-a-paso.html` (EN + ES) con:
  - transcripción limpia de `Ew2Y55oSGjw` y de 2 episodios Landbot,
  - `VideoObject` por cada vídeo embebido,
  - enlaces a `chatbots.html` y al artículo de chat marketing.
- [ ] Medir en Search Console a las 4–6 semanas. Si trae impresiones, replicar.

## Fase 3 · Hub `/videos.html` (solo si Fase 2 funciona)

- [ ] Tarjetas con miniatura, 2 líneas de resumen y enlace a la página de vídeo.
- [ ] Reglas 3, 4 y 8 del mapa de enlazado.

## Qué no hacer todavía

- Crear 27 páginas de vídeo de golpe: sin transcripción son 27 páginas vacías.
- Un canal `/videos/` completo antes de tener 5 páginas buenas.

---

# Cómo accedí a los datos

- **YouTube Studio: sin acceso.** Requiere tu sesión de Google; no entro en paneles autenticados.
- **Canal público: sí.** Leído con el navegador desde `youtube.com/@soyjacqueshauzeur/videos` (nombre, suscriptores, nº de vídeos, títulos e IDs).
- Lo que no puedo leer sin ti: fechas exactas de publicación, duración, visitas, CTR de miniaturas y transcripciones. Eso sale de Studio o de la API con una clave.
