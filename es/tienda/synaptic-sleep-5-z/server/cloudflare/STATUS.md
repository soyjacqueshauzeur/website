# Estado de la integración de pagos (MercadoPago Checkout Pro)

Documento de avance: qué está hecho, qué falta y cómo probarlo.

## Hecho ✅

### Backend serverless (`worker.js` + `catalog.json`)
- **Multi-área**: `tienda`, `services`, `sessions`. Los precios salen del
  **catálogo del servidor** (nunca del navegador).
- `GET /`, `GET /catalogo[?area=]`, `POST /crear-preferencia`,
  `POST /crear-suscripcion`, `POST /webhook/mercadopago`.
- Conversión USD→COP (`USD_COP` o Frankfurter, fallback `fx.USD`).
- **Idempotencia**: acepta `X-Idempotency-Key` y la reenvía a MP (evita duplicados).
- **Webhook**: responde **200 al instante** y procesa en segundo plano
  (`ctx.waitUntil`): consulta el pago y lo **persiste en KV** si el binding
  `PAYMENTS` está configurado (si no, lo loguea).
- **Suscripción mensual** (`/crear-suscripcion` → `preapproval`) lista para usar.

### Cliente compartido (`assets/js/checkout.js`)
- `JH_CHECKOUT.pay(...)` y `JH_CHECKOUT.subscribe(...)`.
- **Anti doble-clic** (`inFlight`) + deshabilitar el botón + `Idempotency-Key`
  por carrito (sessionStorage).
- Carga perezosa (`JH_CHECKOUT.load`).

### Cableado por área
- **Tienda**: `product.html` y `index.html` (opción “pago online”).
- **Servicios**: `hire.js` (carrito mensual → Mercado Pago).
- **1:1**: `class-booking.js` (sesiones × 90 min → Mercado Pago).

### Verificación
- `node --check` de `worker.js`, `checkout.js`, `hire.js`, `class-booking.js`.
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
7. **Cablear `subscribe()`** para cobrar los **servicios mensuales como
   suscripción real** (hoy cobran pago único de N meses). Requiere decidir la UX
   (mensual recurrente vs. prepago de N meses).
8. **Reintentos/sincronización** DB↔MP (si se cae el webhook o vence una
   suscripción, un proceso propio debe conciliar; MP solo notifica cambios).
9. **Reflejar el resultado del pago** en las páginas de retorno
   (`services.html`, `sesiones.html`, `gracias.html`) leyendo `?pago=ok|error`.

### Decisiones de negocio
10. Moneda/tasa: confirmar `USD_COP` fijo o dejar Frankfurter (varía a diario).
11. Tienda: `index.html` con combos 6+/addons no está en el catálogo (solo 1/2/3);
    definir esos precios o dejarlos como cotización por WhatsApp.
12. ¿Suscripción real (preapproval) o prepago de meses para servicios/1:1?

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
