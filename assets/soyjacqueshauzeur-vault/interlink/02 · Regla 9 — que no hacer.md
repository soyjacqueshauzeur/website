---
title: "Regla 9 — qué no hacer (paso a paso)"
tipo: reglas
tags: [il/reglas, seo]
---

# 🚫 Regla 9 · Qué no hacer — qué hacer en cada punto

Cada prohibición con **cómo se detecta**, **cómo se arregla hoy** y **qué hace el checker**. `tools/link-check.mjs` ya las vigila: si vuelven, el build falla.

---

## 1 · ❌ Enlaces en el footer repartidos por igual a todas las páginas

**Qué es el problema.** Un footer sitewide que enlaza a 20–30 páginas convierte cada página del sitio en una emisora de 30 enlaces idénticos. Google lo lee como link farm: diluye el valor de los enlaces reales y hace que ninguna página destaque.

**Qué hacer.**
1. El footer solo repite **la navegación global** (Home · Clients · 1:1 · Services · About · Blog) + legales. Nada de "todas las páginas" ni "todos los servicios".
2. Si quieres destacar algo nuevo, va en el **cuerpo** de las 1–3 páginas donde tiene sentido, no en el pie de las 30.

**Lo que se hizo en la web.**
- Se quitó del footer el enlace `sparrow`, que se repetía en las **49 páginas** y no aportaba nada.
- **Se eliminaron los 3 enlaces muertos** `href="#"` (Privacy · Imprint · Sitemap) que se repetían en las 49 páginas: un `href="#"` apunta a la propia página, así que solo generaba 147 autoenlaces inútiles.
- El footer queda en **7 destinos**: los 6 del nav + `sitemap.xml` (que sí existe).
- Los legales ya **no se escriben a mano**: `site-shell.mjs` comprueba con `existsSync` si `privacy.html` / `imprint.html` / `privacidad.html` / `aviso-legal.html` existen y solo entonces los pinta. Cuando crees esas páginas, aparecen solas; mientras no existan, no hay enlaces rotos.

> [!todo] Pendiente de contenido
> Crear `privacy.html` + `es/privacidad.html` (y `imprint.html` + `es/aviso-legal.html`). No se generaron porque una política de privacidad no se inventa: debe describir lo que el sitio hace de verdad (WhatsApp, Google Calendar, AdSense si está activo). En cuanto existan, el footer las enlaza automáticamente.

**Lo que vigila el checker.**
- Falla si el footer enlaza a más de **8 destinos internos**.
- Avisa si el footer añade un destino que **no está en el nav** (enlace editorial metido de contrabando en el pie).
- Falla con **`href="#"`** en cualquier página indexable (autoenlace).
- Falla con **enlaces rotos**: un `href` a un archivo local que no existe.

### Caso detectado y corregido: logos de cliente sin web
6 clientes por idioma no tienen web y su logo iba envuelto en `<a href="#">`. Ahora es un `<span class="client-logo-link">`: mismo aspecto, sin enlace muerto.

---

## 2 · ❌ Enlaces ocultos, `display:none`, o dentro de JS que no se renderiza

**Qué es el problema.** Un enlace que el usuario no puede ver pero Google sí es una manipulación de ranking. Y un enlace que solo existe después de ejecutar JavaScript puede no existir nunca para el crawler.

**Qué hacer.**
1. Si un enlace no debe verse, **no debe existir**. No hay "enlaces invisibles útiles".
2. Para `aria-hidden="true"` (patrón de accesibilidad: imagen decorativa que duplica un enlace de texto) **sí está permitido**: el enlace equivalente existe con texto. Por eso el checker lo ignora.
3. Todo enlace que importe debe estar en el **HTML servido**, no inyectado por JS. La regla práctica: *ver el código fuente*, no el inspector.

**Lo que se hizo en la web.**
- Las tarjetas de servicio y el listado del blog los pintaba JS (`hire.js`, `blog.js`). El HTML no tenía ni un enlace a los 6 servicios ni a los 4 artículos.
- Ahora hay **fallback estático** dentro del mismo contenedor: el crawler lee los enlaces y el JS los reemplaza al cargar, sin duplicar nada.

**Lo que vigila el checker.** Falla si encuentra un `<a>` con `hidden`, `display:none` o `visibility:hidden` en línea.

---

## 3 · ❌ Enlazar al mismo destino 10 veces en la misma página

**Qué es el problema.** Repetir 20 veces el mismo enlace no le dice a Google "esta página es importantísima"; le dice "esto está automatizado". Además infla el conteo de enlaces y desordena la lectura de anclas.

**Qué hacer.**
1. **Una vez por bloque, no una vez por tarjeta.** Si 48 clientes usan marketing, la página enlaza a marketing **una vez**, no 48.
2. Si la repetición es navegación (siguiente/anterior), el destino cambia de URL con `?page=2`; si es el mismo destino exacto, sobra.

**Lo que se encontró y se corrigió (caso real).**
`clients.html` enlazaba el tag de cada cliente a su servicio: **22 enlaces a `marketing.html`**, 12 a `campaigns.html`, 8 a `chatbots.html` en una sola página. Se sustituyó por una **leyenda de servicios** con un enlace por servicio. Ahora el máximo por destino en esa página es **1**.

**Lo que vigila el checker.**
- Falla por encima de **10** enlaces al mismo destino.
- Avisa por encima de **6**.

---

## 4 · ❌ Enlaces con `nofollow` internos (salvo páginas de pago/UTM)

**Qué es el problema.** `rel="nofollow"` en un enlace interno le dice a Google "no sigas esto" y **desperdicia** la autoridad que esa página podría repartir. En un sitio propio no tiene ningún sentido: si no quieres que una página se indexe, se resuelve con `noindex`, no con `nofollow` en quien la enlaza.

**Qué hacer.**
1. Quita el `nofollow` del enlace interno y, si la página no debe indexarse, ponle `<meta name="robots" content="noindex">` en su propio `<head>`.
2. `nofollow` solo se justifica en: enlaces salientes de pago/patrocinados, parámetros UTM de campaña, y webs de terceros que no quieres respaldar.
3. Ojo con el caso contrario: **no enlaces a páginas `noindex` desde contenido indexable** (regla 6). Si la página no debe entrar en Google, tampoco debe estar en el flujo interno.

**Lo que se hizo en la web.**
- `services.html` y las 6 páginas de servicio enlazaban a `*-hire.html` y `contract.html`, todas `noindex`. Se cambiaron por botones que abren el carrito (donde el contrato sí se ve) y el hub ahora enlaza a **las páginas de servicio reales**.
- Los enlaces externos a webs de clientes conservan `rel="nofollow noreferrer"` — eso es correcto y se queda.

**Lo que vigila el checker.** Falla si un enlace interno lleva `rel="nofollow"`.

---

## Resumen operativo

| Punto | Se detecta | Se arregla | Checker |
|---|---|---|---|
| 1 · Footer farm | footer con >8 destinos o destinos fuera del nav | repetir solo el nav + sitemap | error / aviso |
| 2 · Enlaces ocultos o en JS | `hidden`, `display:none`; HTML sin enlaces | fallback estático, quitar el enlace | error |
| 3 · Destino repetido | >10 enlaces iguales en `<main>` | un enlace por bloque (leyenda/filtro) | error >10, aviso >6 |
| 4 · `nofollow` interno | `rel="nofollow"` con href interno | quitar nofollow o pasar a `noindex` | error |

Extra del checker (mismo espíritu): **`href="#"`** en página indexable y **enlaces a archivos que no existen** → error.

Ver también [[01 · Reglas de enlazado]] (regla 9 completa) y [[00 · Ejecución SEO (MOC)]].
