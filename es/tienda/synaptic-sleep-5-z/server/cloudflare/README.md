# Backend serverless (Cloudflare Worker) — MercadoPago (multi-área)

Backend **genérico** para una web estática (GitHub Pages) que sirve a **varias
áreas**: `tienda`, `services` (servicios) y `sessions` (1:1). Cobra con Checkout
Pro **sin exponer el token**: el `MP_ACCESS_TOKEN` vive como secreto del Worker y
el navegador solo recibe el `init_point`.

Los **precios salen del catálogo del servidor** (`catalog.json`), no del
navegador: el cliente solo manda `{ area, items:[{id,qty}] }`.

## Por qué así
- GitHub Pages solo sirve estáticos: **no** guarda secretos.
- Un token en el HTML/JS es público (visible en DevTools). NUNCA.
- El Worker crea la preferencia con el token secreto y devuelve el `init_point`.

## Catálogo (`catalog.json`)
```json
{
  "accountCurrency": "COP",
  "fx": { "USD": 4000 },
  "areas": {
    "tienda":   { "success": "/es/tienda/.../gracias.html", "items": [ { "id": "synaptic-sleep-5-z-2", "title": "…", "price": 159000, "currency": "COP" } ] },
    "services": { "success": "/services.html?pago=ok", "items": [ { "id": "marketing", "title": "Marketing", "price": 497, "currency": "USD" } ] },
    "sessions": { "success": "/sessions.html?pago=ok", "items": [ { "id": "session-90", "title": "1:1 · 90 min", "price": 15, "currency": "USD" } ] }
  }
}
```
- `accountCurrency` = moneda de tu cuenta MP (COP). Los precios en `USD` se
  convierten a `COP` (tasa `USD_COP` o Frankfurter; fallback `fx.USD`).
- Edita este archivo para añadir productos/servicios; no toques el Worker.

## API
| Método | Ruta | Cuerpo / respuesta |
|---|---|---|
| `GET` | `/` | health check |
| `GET` | `/catalogo[?area=x]` | catálogo público (ids, títulos, precios) |
| `POST` | `/crear-preferencia` | `{ area, items:[{id,qty}], payer?, back?, backFail? }` → `{ ok, total, init_point }` |
| `POST` | `/crear-suscripcion` | `{ area, items:[{id}], payer:{email}, back? }` → `{ ok, init_point }` (mensual) |
| `POST` | `/webhook/mercadopago` | notificaciones (responde 200 al instante) |

- **Idempotencia**: manda `X-Idempotency-Key` (el cliente ya lo genera) para
  evitar cobros duplicados por doble clic/reintentos.
- `back`/`backFail` (opcional) son rutas que empiezan con `/` para las URLs de
  retorno correctas por idioma.

## Desplegar
```bash
cd es/tienda/synaptic-sleep-5-z/server/cloudflare
npm i -g wrangler && wrangler login
wrangler secret put MP_ACCESS_TOKEN     # APP_USR-… (cifrado, fuera del repo)
wrangler deploy
```

### Persistir pagos (opcional, recomendado)
```bash
wrangler kv namespace create PAYMENTS
# copia el id en wrangler.toml ([[kv_namespaces]] binding = "PAYMENTS")
```
El webhook guardará cada pago en `PAYMENTS` (si está enlazado) y también lo
loguea. Sin KV, solo loguea (`wrangler tail`).

## Cliente compartido
`assets/js/checkout.js` expone:
```js
await JH_CHECKOUT.pay({ area, items:[{id,qty}], payer?, back?, backFail? });      // pago único
await JH_CHECKOUT.subscribe({ area, items:[{id}], payer:{email}, back? });        // suscripción mensual
```
Antes de desplegar, edita su `BACKEND` (o define `window.JH_CHECKOUT_BACKEND`).
Incluye anti doble-clic e `Idempotency-Key` automática por carrito.

Ya está conectado en:
- **Tienda** — `es/tienda/synaptic-sleep-5-z/product.html` y `index.html` (opción “pago online”).
- **Servicios** — `assets/js/hire.js` (carrito mensual; si eliges Mercado Pago, paga directo).
- **1:1** — `assets/js/class-booking.js` (sesiones de 90 min; si eliges Mercado Pago, paga directo).

## Webhook
MP notifica a `https://<worker>/webhook/mercadopago`. El Worker **responde 200
enseguida** y procesa en segundo plano (`ctx.waitUntil`): consulta el pago y lo
registra. Responder 200 rápido evita que MP bloquee las notificaciones.

## Seguridad
- **Nunca** pongas el `MP_ACCESS_TOKEN` en HTML/JS/repo/`wrangler.toml`. Solo `wrangler secret put`.
- Precios del servidor; jamás confíes en el precio del navegador.
- CORS: `ALLOWED_ORIGIN` = tu dominio (`https://soyjacqueshauzeur.dev`).

## Mismo patrón en otros hosts
Vercel/Netlify Functions, Cloudflare Pages Functions, Deno Deploy, Render, Fly,
Google Cloud Functions o AWS Lambda.
