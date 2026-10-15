# Estado de la integración de pagos (MercadoPago Checkout Pro)

Documento de avance: qué está hecho, qué falta y cómo probarlo.

## Hecho ✅

### Backend serverless (`worker.js` + `catalog.json`)
- **Multi-área**: `tienda`, `services`, `sessions`. Los precios salen del
  **catálogo del servidor** (nunca del navegador).
- `GET /`, `GET /catalogo[?area=]`, `POST /crear-preferencia`,
  `POST /webhook/mercadopago`.
- Conversión USD→COP (`USD_COP` o Frankfurter, fallback `fx.USD`).
- **Idempotencia**: acepta `X-Idempotency-Key` y la reenvía a MP (evita duplicados).
- **Webhook**: responde **200 al instante** y procesa en segundo plano
  (`ctx.waitUntil`): consulta el pago y lo **persiste en KV** si el binding
  `PAYMENTS` está configurado (si no, lo loguea).
- **Solo tarjeta de crédito**: la preferencia excluye efectivo, transferencia/débito
  y ATM (`payment_methods.excluded_payment_types`), con `installments` y
  `statement_descriptor`. (El saldo "Dinero en cuenta" de MP no se puede excluir.)
- **Cobro = pago único del TOTAL** (`precio × cantidad`), **sin suscripciones**:
  la "cantidad" son los meses (servicios), los bloques de 90 min (1:1) o las
  unidades (tienda). No existe `preapproval` en el flujo.

### Cliente compartido (`assets/js/checkout.js`)
- `JH_CHECKOUT.pay(...)` (pago único del total). **Sin `subscribe()`**: no hay recurrencia.
- **Anti doble-clic** (`inFlight`) + deshabilitar el botón + `Idempotency-Key`
  por carrito (sessionStorage).
- Carga perezosa (`JH_CHECKOUT.load`).

### Aviso de retorno (`assets/js/payment-return.js`)
- Lee `status`/`collection_status`, `payment_id`, `external_reference` (y el
  fallback `?pago=ok|error`), limpia la URL y muestra un aviso (EN/ES).
- Cableado en `services.html` / `es/services.html` y `sessions.html` / `es/sesiones.html`.

### Cableado por área
- **Tienda**: `product.html` y `index.html` (opción “pago online”).
- **Servicios**: `hire.js` (carrito → Mercado Pago; `qty` = meses, **pago único del total**).
- **1:1**: `class-booking.js` (bloques de 90 min → Mercado Pago; **pago único del total**).

### Verificación
- `node --check` de `worker.js`, `checkout.js`, `payment-return.js`, `hire.js`, `class-booking.js`.
- Prueba en navegador: botón “Pay with Mercado Pago” en servicios y 1:1; la tienda
  envía `{area:"tienda", items:[{id,qty}], payer, back}`; 0 errores de consola.
- `i18n-sync-check` y `seo-check`: PASS.

## Falta hacer ⏳

### Tú (no puedo hacerlo desde aquí)
1. **Desplegar el Worker**: `wrangler secret put MP_ACCESS_TOKEN` + `wrangler deploy`.
2. **Poner la URL del Worker** en `assets/js/checkout.js` (const `BACKEND`) o en
   `window.JH_CHECKOUT_BACKEND`.
3. **(Opcional) KV** para persistir pagos: `wrangler kv namespace create PAYMENTS`
   y descomentar el binding en `wrangler.toml`.
4. **Habilitar producción** en la app de MercadoPago (el token `APP_USR-…` debe
   estar activo; antes dio `403 UNAUTHORIZED`).
5. **Webhook en producción**: MP exige URL pública (no localhost). Ya la da el
   Worker; solo asegúrate de que el token y las credenciales son de producción.

### Desarrollo pendiente (código)
6. **Guardar el pedido/usuario en una base de datos** al recibir el webhook
   (hoy: KV opcional + logs). Para tienda → pedido; para servicios → estado del
   cliente; para 1:1 → reserva.
7. **Reintentos/sincronización** DB↔MP (si se cae el webhook). MP solo notifica cambios.
8. **Tienda** (otra etapa): reflejar el resultado del pago en `gracias.html` /
   `pago-fallido.html`. Servicios y 1:1 ya lo hacen con `payment-return.js`.

> Las **suscripciones mensuales quedan descartadas**: el modelo es pago único del
> total (N meses / N bloques de 90 min).

### Decisiones de negocio
9. Moneda/tasa: confirmar `USD_COP` fijo o dejar Frankfurter (varía a diario).
10. Cuotas del comprador: se ofrecen (`installments: 12`); ajustar si se quieren ocultar.
11. Tienda: `index.html` con combos 6+/addons no está en el catálogo (solo 1/2/3);
    definir esos precios o dejarlos como cotización por WhatsApp.

## Cómo probar (una vez desplegado)
```bash
curl https://<worker>/                                  # health
curl "https://<worker>/catalogo?area=services"          # catálogo
curl -X POST https://<worker>/crear-preferencia \
  -H 'Content-Type: application/json' -H 'X-Idempotency-Key: demo-1' \
  -d '{"area":"services","items":[{"id":"marketing","qty":1}]}'
```
Luego abre el `init_point` con un **comprador de prueba** (el `payer.email` debe
ser el del usuario de prueba) y paga con tarjeta de prueba.
