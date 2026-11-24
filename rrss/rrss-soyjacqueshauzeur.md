# Instrucciones de producción de posts — soyjacqueshauzeur

Tú pides la cantidad y el tema. Yo genero los posts con esta forma, siempre igual.

## 1 · Cómo pedirlo (input mínimo)

```
genera <N> posts sobre <tema>
```

Ejemplos:
- `genera 5 posts sobre marketing`
- `genera 10 posts sobre chatbots`
- `genera 7 posts sobre IA`
- `genera 5 posts sobre marketing, con foco en dueños de restaurantes`

Opcional, solo si quieres cambiarlo: red (por defecto Facebook Page), fecha, o una persona concreta distinta de la de siempre.

## 2 · Qué hago con eso

1. Traduzco el tema a **una persona** y **un solo resultado deseado**.
2. Reparto los N posts entre los ángulos de la tabla del punto 5, en ese orden.
3. Escribo cada post como texto listo para copiar y pegar.
4. Guardo cada uno en un `.md` con el nombre del punto 4, en la carpeta del servicio que corresponde.
5. Nada de recursos por mensaje: el único CTA es la web (`https://soyjacqueshauzeur.dev/es/`) para la sesión gratuita, y solo en el post i2.
6. **No publico nada.** Queda en borrador hasta que digas que sí.

## 3 · Reglas fijas

**3.1 Un tema, una persona, un resultado.**
Todos los posts del lote le hablan a la misma persona y del mismo resultado deseado. Cambia el ángulo, no el tema. Si un post no acerca a la persona a ese resultado, no entra.

**3.2 El CTA lleva a la web, nunca a un recurso por DM.**
Cuando un post lleva CTA, siempre es el mismo destino: `https://soyjacqueshauzeur.dev/es/` para **pedir la sesión gratuita** (los viernes no se cobra). Prohibido "comenta X y te lo mando", PDFs, plantillas o cualquier cosa que haya que enviar por mensaje.

**3.2b No todos los posts llevan CTA.**
Como máximo uno por día: el i2. El resto termina en una idea, una pregunta que no pide nada o un número. Un feed donde todo pide algo deja de leerse.

**3.3 Un post de oferta de cada cinco.**
Solo uno de cada cinco menciona precio o sesiones. El resto construye confianza.

**3.4 Sin cifras inventadas.**
Nada de testimonios, casos ni resultados de clientes que no estén verificados. Si no hay dato real, el post se escribe como proceso u opinión.

**3.5 Nada de publicar sin aprobación.**
Los archivos son borradores. Publicar requiere tu OK explícito, post por post.

## 4 · Archivos y nombres

```
rrss/<servicio>/<AAAAMMDD>-i<N>-<slug>.md
```

- `<servicio>` = `marketing` · `campaigns` · `chatbots` · `ai` · `financial-planning` · `ecommerce`
- `<N>` = número del item dentro del día (1, 2, 3…), en orden de publicación
- `<slug>` = nombre corto en kebab-case, sin acentos ni mayúsculas
- Ejemplo: `rrss/marketing/20261104-i3-error-publicar-sin-direccion.md`

**Dentro del archivo va solo el post.** Sin título, sin hora, sin ángulo, sin variantes, sin métricas. Texto plano, párrafos separados por línea en blanco.

## 5 · Rotación de ángulos

| N | Ángulo | Qué hace |
|---|---|---|
| i1 | Dolor | Nombra el síntoma que la persona ya siente |
| i2 | Invitación | Explica un método propio y cierra con el CTA a la web: sesión gratuita. Es el único post del día con CTA. |
| i3 | Error / creencia | Rompe lo que la persona cree que es su problema |
| i4 | Proceso / historia | Muestra cómo trabajo por dentro, sin cifras inventadas |
| i5 | Objeción | Ataca la excusa más común antes de que la pongan |
| i6 | Deseo | Pinta el día a día con el resultado ya conseguido |
| i7 | Lo que ya intentó | Por qué lo anterior no funcionó |
| i8 | Comparación | Dos formas de hacerlo, con nombres |
| i9 | Lista útil | Pasos concretos que se pueden aplicar hoy |
| i10 | Resultado ajeno | Solo con dato real verificable; si no hay, se usa proceso |

Si N > 10, se repite la tabla con gancho, ejemplo e historia distintos. Un ángulo que funcionó no se abandona: se varía.

## 6 · Estilo

**Regla de lenguaje: 70% cliente / 30% técnico.**

El 70% de los posts se escribe para el dueño de una pyme que no sabe qué es un canonical, un sitemap ni Core Web Vitals. Ese lenguaje se traduce siempre:

| En vez de | Escribe |
|---|---|
| indexación / que Google indexe | que Google te pueda leer |
| Core Web Vitals / LCP / CLS | cuánto tarda tu web en abrir en el celular |
| CTR / SERP / keywords | cuántas personas te ven y cuántas te escriben |
| canonical / sitemap / datos estructurados | que tu página y tu ciudad aparezcan bien en Google |
| backlinks | quién habla de tu negocio y te enlaza |

El 30% restante puede ser técnico de verdad, con esos términos y detalle, para quien ya entiende. Reparto por día (5 posts): 4 de cliente + 1 técnico, o 3 de cliente + 2 técnicos. El i1 siempre es de cliente.

- Español neutro LATAM, trato de "tú", frases cortas, cero jerga de marketing.
- Emojis: solo en el **60% de los posts**. Fuera de los listados, **máximo 3 por post**, nunca en el párrafo del CTA. Se eligen por ángulo: 👀 dolor · 👇 invitación · ⚠️ error · ✅ proceso · 🤔 objeción.
- En listados y viñetas, el emoji va como check de cada ítem y **no cuenta para el máximo**: todos los ítems llevan **el mismo** emoji (✅ para criterios o preguntas, 👉 para pasos o ejemplos), sin mezclar unos con otros.
- Gancho en la primera línea: si se puede borrar sin perder nada, se reescribe.
- Sin hashtags por defecto (solo si los pides).
- Entre 12 y 25 líneas por post.

## 7 · Iterar con datos

- `el post i3 funcionó, dame 5 variaciones` → mismo ángulo, gancho y ejemplo distintos.
- `genera 5 más sobre <tema>` → continúa la serie desde i6.
- `descarta el ángulo de deseo` → lo saco de la rotación para ese tema.

Los ángulos que despegan se convierten en serie, no en idea suelta.
