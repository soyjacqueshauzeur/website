---
title: "Reglas de enlazado interno"
tipo: reglas
tags: [il/reglas, seo]
---

# 📐 Reglas de enlazado interno

Normas que deben cumplir **todas** las páginas. Si una nota del mapa contradice esto, manda esto.

## 1 · Jerarquía (profundidad)

- **Nivel 0:** [[home]]
- **Nivel 1:** [[services]], [[clients]], [[sessions]], [[blog-listing]]
- **Nivel 2:** [[marketing]], [[ai]], [[chatbots]], [[campaigns]], [[ecommerce]], [[financial-planning]]
- **Nivel 3:** artículos del blog

Regla: **toda URL indexable a ≤ 3 clics de la home**. Hoy los servicios están a 3–∞ porque 4 son huérfanas.

## 2 · Navegación global (no cuenta como enlazado editorial)

El shell (`tools/site-shell.mjs`) pone en todas las páginas: `Home · Clients · 1:1 · Services · About me · Blog` + CTA. Eso es el **suelo**, no el techo. Los enlaces del cuerpo son los que mueven autoridad y relevancia.

## 3 · Cantidad

- **3–8 enlaces contextuales por página** en el cuerpo (excluyendo nav y footer).
- Mínimo **3 enlaces entrantes** por URL indexable, y al menos **1 desde una página de nivel superior**.
- Ningún huérfano: si una página del sitemap no está en este mapa, falta.

## 4 · Anclas (anchor text)

- Descriptivas y con la consulta real: `marketing mensual para tu negocio`, no `clic aquí`.
- **Prohibido:** `clic aquí`, `leer más`, `ver más`, `aquí`, `más info`, `este enlace`.
- Primera aparición hacia un destino: ancla exacta o parcial. Repeticiones: variada.
- Nunca dos enlaces seguidos con el mismo ancla hacia destinos distintos.
- No sobre-optimizar: no repitas la keyword exacta en las 3 páginas que apuntan al mismo destino.

## 5 · Ubicación

- Primer enlace contextual en el **primer tercio** del contenido (antes del primer scroll en móvil).
- Dentro del texto, en una frase que tenga sentido sin el enlace.
- Los bloques de "servicios relacionados" y "temas relacionados" van al final, como refuerzo, no como único enlace.

## 6 · Destinos prohibidos

Nunca enlazar desde contenido indexable a páginas `noindex`:

`*-hire.html`, `contract.html`, `gallery.html`, `blog-t.html`, `price-t.html`, `404.html`.

Si una página es `noindex`, es un callejón sin salida: no debe estar en el flujo interno. Hoy `services.html` enlaza a las 6 `*-hire.html` → **hay que cambiarlo**.

## 7 · Simetría de clusters

Dentro de un cluster, el enlace va en **ambos sentidos**:

- [[marketing]] ↔ [[campaigns]] · [[marketing]] ↔ [[ecommerce]]
- [[ai]] ↔ [[chatbots]]
- [[ecommerce]] ↔ [[financial-planning]]

## 8 · Bilingüe

El grafo es **idéntico en EN y ES**. Cambia solo:

- La ruta (`/marketing.html` → `/es/marketing.html`).
- El ancla (traducida, no calcada).

Un enlace de una página EN debe apuntar a otra página EN. Nunca cruzar idiomas desde el cuerpo (el cambio de idioma lo hace el flag del nav).

## 9 · Qué no hacer

- ❌ Enlaces en el footer repartidos por igual a todas las páginas (link farm).
- ❌ Enlaces ocultos, `display:none`, o dentro de JS que no se renderiza.
- ❌ Enlazar al mismo destino 10 veces en la misma página.
- ❌ Enlaces con `nofollow` internos (salvo páginas de pago/UTM).

## 10 · Mantenimiento

Al añadir una página nueva:

1. Crear su nota en `interlink/paginas/`.
2. Enlazarla desde su hub de nivel superior.
3. Añadirla a 1–2 páginas hermanas.
4. Actualizar la tabla de [[00 · Índice interlink#Estado real vs objetivo|Estado real vs objetivo]].
