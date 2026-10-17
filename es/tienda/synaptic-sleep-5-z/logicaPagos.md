# Lógica de precios y pagos · SYNAPTIC SLEEP 5-Z

Documento de referencia de la lógica comercial del checkout (`t3.html`).
No forma parte del sitio publicado: es documentación interna.

**Estado**

| Módulo | Qué resuelve | Estado |
|---|---|---|
| `PRICING` | Precio del **producto principal** (descuento por volumen) | ✅ implementado en `t3.html` |
| `CHECKOUT_RULES` | Reglas del **pedido** (abono contraentrega, umbrales) | 🟡 propuesto, pendiente de implementar |

---

## 1. Mapa general

```
                 ┌──────────────────────────────┐
                 │  PRICING  (por producto)     │
                 │  precio base + volumen       │
                 └──────────────┬───────────────┘
                                │  total del carrito
                 ┌──────────────▼───────────────┐
                 │  CHECKOUT_RULES (por pedido) │
                 │  abono COD + umbrales        │
                 └──────────────────────────────┘
```

**Regla de oro:** el precio se calcula **por producto**; el abono se calcula **sobre el total del pedido** (`orderTotal()`), nunca sobre un producto concreto. Así funciona igual con un artículo de $18.000 que con uno de $420.000, sin tocar código.

---

## 2. `PRICING` — descuento por volumen del producto principal

### 2.1 Configuración (único punto a editar)

```js
var PRICING = {
  PRECIO_BASE: 84000,        // precio de 1 unidad (COP)
  PRECIO_ANTERIOR: 119000,   // precio "antes" de 1 unidad (tachado)
  UNIDADES_MAX: 10,          // unidades donde se alcanza el tope
  DESCUENTO_MAX_PCT: 10,     // ← cambia este número y todo se recalcula
  REDONDEO: 100              // precio final redondeado a la centena
};
```

### 2.2 Fórmulas

```js
pctVolumen(n)      = DESCUENTO_MAX_PCT · (n − 1) / (UNIDADES_MAX − 1)   // 1 unidad = 0 %
precioPrincipal(n) = redondear(PRECIO_BASE · n · (1 − pctVolumen(n)/100))
precioAnterior(n)  = PRECIO_ANTERIOR · n
ahorro(n)          = precioAnterior(n) − precioPrincipal(n)
```

- El descuento es **progresivo y lineal**: con `DESCUENTO_MAX_PCT = 10` el primer escalón (2 unidades) es 1,11 % y el último (10 unidades) es 10 %.
- Si se cambia a `20`, el reparto pasa a 2,22 % … 20 % automáticamente.
- `REDONDEO` evita precios tipo `$166.133`.

### 2.3 Resultado con la configuración actual

| Unidades | Total | Precio unitario | Ahorro vs. $119.000 c/u | % descuento |
|---|---|---|---|---|
| 1 | $84.000 | $84.000 | $35.000 | 0 % |
| 2 | $166.100 | $83.050 | $71.900 | 1,11 % |
| 3 | $246.400 | $82.133 | $110.600 | 2,22 % |
| 4 | $324.800 | $81.200 | $151.200 | 3,33 % |
| 5 | $401.300 | $80.260 | $193.700 | 4,44 % |
| 6 | $476.000 | $79.333 | $238.000 | 5,56 % |
| 7 | $548.800 | $78.400 | $284.200 | 6,67 % |
| 8 | $619.700 | $77.463 | $332.300 | 7,78 % |
| 9 | $688.800 | $76.533 | $382.200 | 8,89 % |
| 10 | $756.000 | $75.600 | $434.000 | 10,00 % |

**Prueba de la variable:** con `DESCUENTO_MAX_PCT: 20` → 2 uds `$164.300`, 10 uds `$672.000`, badge del hero `−44 %`, ahorro `$518.000`.

### 2.4 Qué se recalcula solo

- Los 3 combos (precio, “c/u”, “Ahorras $…”).
- Precio del hero, badge de porcentaje, buy box y su “c/u”.
- Resumen, total, CTA (`Comprar ahora · $…`), montos por método de pago.
- Los **complementos no se tocan**: mantienen su precio fijo en `CATALOG.addons`.

### 2.5 Interacción con la campaña de los días 15 y fin de mes

`state.discount` (0.9 en esos días) se aplica **encima** del descuento por volumen:

```js
precioFinal = precioPrincipal(n) · state.discount
```

Es decir, el día 15 el descuento de volumen y el 10 % de campaña **se suman**. Si se quiere que sean excluyentes, cambiar `state.discount` a `1` cuando `pctVolumen(n) > 0`.

---

## 3. `CHECKOUT_RULES` — reglas del pedido (contraentrega)

### 3.1 Costos reales de referencia

| Concepto | Valor |
|---|---|
| Flete de ida | $20.000 |
| Flete de retorno (si rechazan) | $20.000 |
| Manipulación | $2.000 |
| **Pérdida por pedido rechazado** | **$42.000** |

Con 25 % de rechazo son **$1.050.000 perdidos por cada 100 pedidos**. El abono contraentrega existe para cubrir esa pérdida, no para ganar más.

### 3.2 Configuración propuesta

```js
var CHECKOUT_RULES = {
  flete: { ida: 20000, retorno: 20000 },

  cod: {
    ABONO_ACTIVO: true,   // true → contraentrega CON abono · false → paga todo al recibir
    ABONO_DESDE: 150000,  // solo se pide abono si el pedido llega a este total

    PCT: 20,            // % del total que se abona por adelantado
    MIN: 12000,         // piso absoluto
    MAX: 60000,         // techo absoluto

    PEDIDO_MIN: 70000,  // bajo este total no se ofrece contraentrega
    PEDIDO_MAX: 250000  // sobre este total solo prepago
  }
};
```

### 3.3 Fórmula

```js
function abonoCOD(total) {
  var c = CHECKOUT_RULES.cod;

  // Fuera de rango: la opción contraentrega no se muestra
  if (total < c.PEDIDO_MIN || total > c.PEDIDO_MAX) return null;

  var v = total * c.PCT / 100;
  v = Math.max(v, c.MIN);          // piso
  v = Math.min(v, c.MAX);          // techo
  v = Math.min(v, total * 0.5);    // nunca más de la mitad del pedido
  return Math.round(v / 1000) * 1000;  // número "de verdad" ($13.000, no $13.247)
}
```

`abonoCOD()` devuelve:

| Valor | Significado | UI |
|---|---|---|
| `null` | Contraentrega no disponible | La opción se **oculta** + nota con el motivo |
| `0` | Contraentrega **sin abono** (interruptor apagado o pedido bajo `ABONO_DESDE`) | “Pagas $X al recibir” |
| `> 0` | Contraentrega **con abono** | “Abonas $X ahora · $Y al recibir” + filas en el resumen |

### 3.4 Overrides por producto (márgenes distintos)

```js
var PRODUCT_COD = {
  'synaptic-sleep-5-z':      { pedidoMin: 70000, pct: 15 },
  'synaptic-sleep-5-z-mini': { pedidoMin: 35000, pct: 20 },  // margen más fino
  'colchon-premium':         { pedidoMin: 150000, pct: 8 }   // ticket alto, abono suave
};
```

Un producto nuevo hereda la regla general sin configuración.

### 3.5 Política de 3 niveles

| Ticket del pedido | Política | Razón |
|---|---|---|
| **≥ $100.000** | Abono 15 % (mín. $12.000, máx. $60.000) | Aguanta hasta 60 % de rechazos |
| **$70.000 – $100.000** | Abono fijo $15.000 (incluye envío) | El fijo protege más que el % en tickets cortos |
| **< $70.000** | Solo prepago — o envío pagado ($20.000) + resto contraentrega | El flete pesa más que el margen |

---

## 4. Viabilidad por ticket (margen 40 % del precio)

`Rechazo máximo = m / (m + L − a)` con `m` = margen por entregado, `L` = $42.000, `a` = abono 15 %.

| Ticket | Abono | Margen por entregado | Rechazo máximo soportado |
|---|---|---|---|
| $40.000 | — | $0 | ❌ inviable |
| $70.000 | $12.000 | $18.000 | 36 % |
| $84.000 | $13.000 | $26.400 | 47 % |
| $113.000 | $17.000 | $43.800 | 64 % |
| $200.000 | $30.000 | $96.000 | 100 % |
| $420.000 | $60.000 (tope) | $228.000 | 100 % |

**Conclusión:** por debajo de ~$70.000 el contraentrega **no se sostiene**. Un producto de $24.000 con un rechazo pierde el margen de ~7 ventas entregadas.

---

## 5. Economía por 100 pedidos (producto de $84.000)

Supuestos: precio $84.000, costo producto $33.600 (40 %), flete ida $20.000, recaudo $4.000, margen por entregado **$26.400**.

| Rechazo | Sin abono | Con abono $13.000 | Diferencia |
|---|---|---|---|
| 15 % | $1.614.000 | $1.803.000 | +12 % |
| 25 % | $930.000 | $1.245.000 | +34 % |
| 35 % | $246.000 | $687.000 | **+179 %** |

Y con el efecto conductual (el abono reduce el rechazo ~10 puntos):

| Escenario | Sin abono | Con abono | Diferencia |
|---|---|---|---|
| 25 % → 15 % | $930.000 | $1.803.000 | +94 % |
| 35 % → 25 % | $246.000 | $1.245.000 | +406 % |

---

## 6. Cómo se presenta al cliente

```
● Pago contraentrega
  Abonas $13.000 ahora · $71.000 al recibir
  El abono cubre el envío si rechazas el pedido

○ Pago anticipado · ahorras $13.000 y sale hoy
```

```
RESUMEN
  Productos                        $84.000
  Abono pagado hoy                −$13.000
  ─────────────────────────────────────────
  Pagas al recibir                 $71.000
```

**Reglas de comunicación**

- El abono **es parte del precio**, nunca un recargo ni un “+10 %”.
- Se muestra **antes** de pagar (en la opción de pago y en el resumen).
- Si el fallo es del vendedor (sin stock, dañado, no llega) ⇒ **devolución íntegra**.
- Si el cliente rechaza o no recibe tras 2 intentos ⇒ el abono cubre logística (declarado en Términos).
- Nunca más del 50 % del pedido.

---

## 6.1 Mensaje de WhatsApp (contraentrega)

El mensaje que se abre al confirmar debe permitirle al vendedor **saber exactamente cuánto cobrar**:

```
Hola, quiero confirmar mi pedido:

• 2 × SYNAPTIC SLEEP 5-Z — $166.100

Total del pedido: $166.100
Ahorro del cliente: $71.900

Pago: Contraentrega — abono $33.000 · saldo $133.100
Abono que YA pagó: $33.000
COBRAR AL RECIBIR: $133.100
Nombre: Ana Gómez
WhatsApp: +57 3001234567
Ciudad: Medellín · Antioquia
Dirección: Calle 10 #20-30 · Barrio Laureles
```

Sin abono (`ABONO_ACTIVO: false` o pedido bajo el umbral):

```
Pago: Contraentrega — paga todo al recibir
COBRAR AL RECIBIR: $166.100 (sin abono, paga todo al recibir)
```

---

## 7. Cambios técnicos necesarios para activarlo

1. **`grandTotal()` deja de sumar recargo**: el abono no se suma, **divide** el total en “ahora” + “al recibir”.
2. Nuevas filas en el resumen: `Abono pagado hoy` y `Pagas al recibir`.
3. `[data-pay-amount="contraentrega"]` pasa a mostrar **el saldo**, no el total.
4. El submit de contraentrega va a **cobrar el abono** (`JH_CHECKOUT.pay({ area:'tienda', items:[{ id:'abono-cod', qty:1 }] })`) antes de despachar.
5. `catalog.json` del worker: nueva entrada `abono-cod` (el precio lo manda el servidor, nunca el navegador).
6. Webhook: estado `abono_pagado` antes de generar guía.
7. Payload y mensaje de WhatsApp: `abono`, `saldo`, `codDisponible`.

---

## 8. Antifraude (va junto al abono, no después)

- **Confirmación con código por WhatsApp** antes de despachar (*“responde OK”*). Costo $0, filtra direcciones falsas.
- **Máximo 2 pedidos contraentrega por teléfono/cédula** en 30 días.
- **Lista negra por dirección** tras el segundo rechazo.
- **Límite de unidades** para COD (p. ej. 3) independiente del ticket.

El abono cubre el flete; la confirmación evita el pedido falso. Una sin la otra no sirve.

---

## 9. Riesgos y legal

| Riesgo | Mitigación |
|---|---|
| Baja la conversión al pedir dinero | Medir **utilidad por 100 visitas**, no solo la tasa de pedidos |
| Reclamos por el abono no devuelto | Reglas escritas en el checkout y en Términos; devolución íntegra si el fallo es del vendedor |
| Ley 1480 (retracto, Colombia) | El abono se imputa a **gastos de transporte y manipulación** (art. 47 permite cobrarlos al consumidor). Cláusula redactada en `terminos.html` §5; revisar con abogado antes de publicar |
| Cliente abona y desaparece | El abono ya cubre el flete: no hay pérdida |
| Verificación manual de abonos | Nequi/Daviplata con comprobante o link de pago automático |

---

## 9.1 Cláusula publicada en Términos (numeral 5)

> **5. Abono de separación (pago contraentrega)**
>
> En los pedidos con pago contraentrega puedes abonar por adelantado una parte del precio (el «abono de separación»). Ese abono **no es un cobro adicional**: se descuenta del total y el saldo se paga al recibir el pedido. Su valor se informa antes de confirmar y nunca supera el 50 % del total.
>
> **Rechazo o desistimiento de la entrega.** Si rechazas el pedido al momento de la entrega, no lo recibes tras dos intentos de entrega o no es posible ubicarte en la dirección informada, el abono **no será reembolsado** y se imputará a los costos de transporte de ida y retorno y a la manipulación del producto, que en ese escenario asume el vendedor.
>
> **Retracto.** Si ejerces el derecho de retracto (artículo 47 de la Ley 1480 de 2011) dentro de los cinco (5) días hábiles siguientes a la entrega, el abono **no se reembolsa** y se imputa a los gastos de transporte de retorno y manipulación que conlleva la devolución. El saldo del precio se reembolsa conforme a la Política de devoluciones y garantía.
>
> **Excepciones (devolución íntegra del abono).** Si el pedido no se despacha por falta de stock, si el producto llega defectuoso o si la entrega falla por causa imputable al vendedor o a la transportadora, el abono se devuelve en su totalidad.

También replicada en `devoluciones.html` (resumen rápido, §1 y §6) para que no haya contradicciones entre páginas.

**Advertencia legal:** una cláusula que haga perder todo el dinero en un retracto sin imputarlo a costos reales puede considerarse abusiva (Ley 1480, arts. 43 y 47). La redacción anterior imputa el abono a **transporte y manipulación**, que sí son deducibles, y deja a salvo los casos en que el fallo es del vendedor. Debe revisarla un abogado antes de publicar.

---

## 10. Orden de implementación recomendado

1. **Abono $13.000–$15.000 + confirmación por WhatsApp + límite de 3 unidades.**
2. Medir 30 días: si el rechazo no baja del 20 %, subir el abono; si baja del 12 %, dejarlo quieto.
3. Recién entonces evaluar prepago con descuento (mismo número, en positivo).

---

*Documento generado a partir de la implementación de `t3.html` y de las decisiones de negocio discutidas. Los valores de flete, costo y márgenes son supuestos: reemplazarlos por los reales antes de publicar.*
