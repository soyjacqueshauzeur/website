---
title: "F — FAQPage sin contenido visible"
tipo: plan
tags: [plan, seo, resuelto]
---

# 🧩 F · Datos estructurados que no se corresponden

## El problema
Las 12 páginas de servicio (6 × 2 idiomas) declaraban un `FAQPage` en el JSON-LD con preguntas y respuestas **que no existían en la página**. Google exige que el contenido estructurado esté visible; además, desde 2023 los rich results de FAQ solo se muestran a sitios gubernamentales o sanitarios. Resultado: ruido, riesgo y `Search appearance` vacío.

## La decisión: publicar el FAQ, no borrarlo
Había dos caminos — quitarlo o hacerlo visible. Se eligió **hacerlo visible** porque las páginas de servicio tenían 291 palabras: el FAQ es contenido real que faltaba, no un adorno.

Borrar el marcado habría dejado la página igual de vacía. Publicarlo da:
- contenido indexable (de ~290 a ~500 palabras por página),
- respuestas a las objeciones reales (precio, permanencia, combinar servicios),
- coherencia entre lo que dice el JSON-LD y lo que ve el usuario,
- material que los LLM pueden citar.

## Cómo se resolvió (una sola fuente)
```
tools/service-faq.mjs          ← la lista de preguntas/respuestas
   ├── tools/apply-seo.mjs     ← la convierte en el FAQPage del JSON-LD
   └── tools/build-hire-pages.mjs ← la pinta como <section id="faq">
```
Ningún lado puede desincronizarse: si cambia una pregunta, cambia en los dos.

- Sección visible: `<section class="snug" id="faq">` con `.faq-grid` / `.faq-card`, **antes del CTA final** (donde el usuario ya conoce el precio y le quedan dudas).
- El JSON-LD se genera con la **misma** función `serviceFaqs()`.

## Verificación

```bash
node -e "…"   # comparativa visual vs JSON-LD
```
Resultado: `marketing.html` 4 visibles / 4 en JSON-LD idénticos · `es/chatbots.html` 5 / 5 idénticos.

Y `seo-check` en PASS. `Search appearance` seguirá vacío (los rich results de FAQ ya no aplican) — pero ahora el contenido **cuenta** para el ranking, no solo para el marcado.

## Lo que queda
Añadir 2–3 preguntas más por servicio sacadas de conversaciones reales de WhatsApp. Cada una es una consulta long-tail que hoy no está cubierta. Ver [[03 · Chatbots]].
