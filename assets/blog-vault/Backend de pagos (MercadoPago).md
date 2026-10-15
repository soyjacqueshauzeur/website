---
title: Backend de pagos (MercadoPago)
tags: [backend, pagos, mercadopago, tutorial, cloudflare]
---

# 🔐 Backend de pagos (MercadoPago) — Tutorial

> Documento de aprendizaje: cómo funciona el backend de pagos de la web, por qué
> es seguro y cómo ponerlo en marcha paso a paso. El sitio es **estático**
> (GitHub Pages); el cobro seguro lo hace un **backend serverless** (Cloudflare
> Worker). Esta nota NO contiene tokens ni credenciales.

---

## ✅ Ya completado (código, sin desplegar)

- [x] Backend Worker escrito (`es/tienda/soy/server/cloudflare/`): multi-área (`tienda/services/sessions`), precios del **catálogo del servidor**, `X-Idempotency-Key`.
- [x] Preferencia **solo tarjeta de crédito** (`excluded_payment_types` + `installments` + `statement_descriptor`).
- [x] **Sin suscripciones**: eliminado `/crear-suscripcion`; modelo = **pago único del total**.
- [x] Cliente `assets/js/checkout.js` (`JH_CHECKOUT.pay`, anti doble-clic, idempotencia).
- [x] Cableado: **servicios** (`hire.js`) y **1:1** (`class-booking.js`) → Mercado Pago.
- [x] Aviso de retorno `assets/js/payment-return.js` + cableado en `services`/`sessions` (EN/ES).
- [x] Copy "pago único por N meses" (EN/ES) + `build-hire-pages` regenerado + checks en verde.
- [x] Worker movido a `es/tienda/soy/server/`.

---

## 1. Conceptos (entender primero)

- [x] **GitHub Pages vs backend.** GitHub Pages solo sirve archivos (HTML/CSS/JS) y **todo es público**; no ejecuta código ni guarda secretos. El **Cloudflare Worker** es código que corre en un servidor, **sí** guarda secretos y **sí** recibe webhooks → es tu backend.
- [ ] **¿Dónde vive el token?** El `MP_ACCESS_TOKEN` **nunca** va en el repo. Se guarda cifrado en Cloudflare con `wrangler secret` y el Worker lo lee como `env.MP_ACCESS_TOKEN`.
- [ ] **Qué hay ya:** el **código** del Worker (`es/tienda/soy/server/cloudflare/`) y el cliente (`assets/js/checkout.js`). **Aún no está desplegado** (no hay cuenta Cloudflare ni login).

---

## 2. Puesta en marcha (Wrangler)

> Comandos de referencia:
> ```bash
> npm i -g wrangler
> wrangler login
> cd es/tienda/soy/server/cloudflare
> wrangler secret put MP_ACCESS_TOKEN
> wrangler deploy
> ```

- [ ] Crear cuenta gratuita en https://dash.cloudflare.com
- [ ] Instalar Wrangler: `npm i -g wrangler`
- [ ] Loguearte: `wrangler login` (abre el navegador; autorizas)
- [ ] Ir a la carpeta del Worker: `cd es/tienda/soy/server/cloudflare`
- [ ] Guardar el token: `wrangler secret put MP_ACCESS_TOKEN` (pegas el `APP_USR-…`; NO entra al repo)
- [ ] Publicar: `wrangler deploy` (devuelve una URL `https://<nombre>.<cuenta>.workers.dev`)
- [ ] Copiar esa URL y pegarla en `assets/js/checkout.js` (const `BACKEND`)

---

## 3. Base de datos: D1 (fuente de verdad)

D1 = base SQL en Cloudflare (permite consultas/reportes). KV = clave→valor (más simple, sin consultas). *Elección del proyecto: **D1**.*

- [ ] Crear la base: `wrangler d1 create jh-payments` (devuelve un `database_id`)
- [ ] Añadir el binding en `wrangler.toml`:
  ```toml
  [[d1_databases]]
  binding = "DB"
  database_name = "jh-payments"
  database_id = "<el-id-que-devuelve-wrangler>"
  ```
- [ ] Crear la tabla `payments`:
  ```sql
  CREATE TABLE payments (
    id                 TEXT PRIMARY KEY,   -- payment_id de MercadoPago
    status             TEXT NOT NULL,
    status_detail      TEXT,
    amount             INTEGER,            -- monto entero (moneda de la cuenta)
    currency           TEXT,               -- COP
    area               TEXT,               -- services | sessions | tienda
    external_reference TEXT,
    created_at         TEXT
  );
  ```

---

## 4. Google Sheets (espejo legible)

D1 es la **fuente de verdad**; la Sheet es un **espejo** que se llena **solo** (desde el Worker). La hoja siempre **privada**.

- [ ] Elegir método:
  - [ ] **A) Apps Script (simple):** `doPost` en la hoja + Web App protegido con token secreto.
  - [ ] **B) Service Account (más segura):** cuenta de servicio con la hoja compartida (Editor); clave como secreto del Worker.
- [ ] Compartir la hoja **solo** con tu cuenta (y con la cuenta de servicio/app).
- [ ] Confirmar que la hoja **no** es pública ("anyone with the link" = off).

---

## 5. Webhook + verificación de firma

MercadoPago llama a `POST /webhook/mercadopago`; el Worker responde **200 al instante** y procesa en segundo plano.

- [ ] Implementar **verificación de firma** (`x-signature` + `x-request-id` → HMAC-SHA256 con el secreto de webhooks de MP). *Pendiente en `worker.js`.*
- [ ] Guardar el pago en **D1** al confirmarse.
- [ ] Agregar la fila correspondiente en la **Google Sheet**.
- [ ] Registrar/validar la URL del webhook en MercadoPago.

---

## 6. Captura de datos y conciliación (email / monto)

> Para saber **quién pagó** y **conciliar** el pedido con MercadoPago se usa el
> **id de pedido** (`external_reference`); el email es validación **secundaria**
> (el comprador puede pagar con otra cuenta MP).

### 6.1 Capturar los datos (antes de pagar)
- [ ] Añadir un formulario mínimo en el sitio (servicios / 1:1 / tienda): **nombre + email** (+ teléfono y dirección si aplica).
- [ ] Validar en cliente y reenviar al **Worker** junto con `{ area, items, months }`.
- [ ] Nunca capturar datos de tarjeta (eso lo maneja MP).

### 6.2 Guardar el pedido (D1)
- [ ] Crear la tabla `orders`:
  ```sql
  CREATE TABLE orders (
    id             TEXT PRIMARY KEY,   -- orderId (tu referencia)
    area           TEXT,
    items_json     TEXT,               -- ítems + meses
    total          INTEGER,            -- total esperado (COP)
    currency       TEXT,
    customer_name  TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    address_json   TEXT,               -- dirección (si aplica)
    payment_id     TEXT,               -- se llena al confirmar
    status         TEXT DEFAULT 'created', -- created | paid | mismatch
    created_at     TEXT
  );
  ```
- [ ] Al crear el pedido: generar `orderId` y guardar los datos del cliente.
- [ ] Pasar ese `orderId` a MercadoPago como **`external_reference`** (y `payer.email` opcional).

### 6.3 Conciliar en el webhook
- [ ] Buscar el pedido por `external_reference` en D1.
- [ ] Comparar:
  - [ ] `status == approved`
  - [ ] `transaction_amount == orders.total`
  - [ ] `payer.email == orders.customer_email` (marcar sí/no)
- [ ] Actualizar: `status = 'paid'` si coincide; `'mismatch'` si email o monto no cuadran.
- [ ] Registrar en la **Google Sheet** con una columna **“¿coincide email?”** (sí/no) + `payment_id`.

### 6.4 Discrepancias
- [ ] Si email ≠ o monto ≠ → marcar `mismatch` (no dar por pagado automáticamente).
- [ ] (Opcional) Avisarme por email/WhatsApp ante `mismatch`.

---

## 7. Flujo de un pago (repaso)

1. El sitio manda al Worker **solo** `{ area, items:[{id,qty}] }` — sin datos de tarjeta.
2. El Worker calcula el **total** con precios de su catálogo y crea la preferencia.
3. El navegador se **redirige a MercadoPago** (datos de tarjeta solo los ve MP).
4. MP cobra y devuelve al sitio con `status`.
5. MP llama al **webhook** → el Worker valida la firma, guarda en **D1** y en la **Sheet**.

Modelo de cobro: **un solo pago del total** (`precio × cantidad`). Sin suscripciones.

---

## 8. Rotar el token (si se filtra)

- [ ] En MercadoPago → renovar el Access Token.
- [ ] `wrangler secret put MP_ACCESS_TOKEN` (pegar el nuevo).
- [ ] `wrangler deploy` (para que el Worker tome el secreto nuevo).
- [ ] Verificar que el token viejo ya no funciona.

---

## 9. Reglas de seguridad (revisar)

- [ ] El **token** solo en Cloudflare (`wrangler secret`); jamás en el repo.
- [ ] El **sitio** nunca ve datos de tarjeta (Checkout Pro es hosted por MP).
- [ ] Los **precios** se calculan en el servidor.
- [ ] **Validar la firma** del webhook.
- [ ] Guardar **lo mínimo** (pago, estado, monto, fecha).
- [ ] La **Google Sheet** siempre privada.
- [ ] **HTTPS** en todo + **rotar** el token ante dudas.
- [ ] **Idempotencia** (`X-Idempotency-Key`) para no duplicar pagos.

---

## 10. Checklist final

- [ ] Cuenta Cloudflare creada
- [ ] `wrangler login`
- [ ] `wrangler secret put MP_ACCESS_TOKEN`
- [ ] `wrangler d1 create jh-payments` + binding
- [ ] Tabla `payments` creada
- [ ] `wrangler deploy` + URL copiada
- [ ] URL pegada en `checkout.js` (`BACKEND`)
- [ ] Formulario de captura (nombre/email/teléfono/dirección) → Worker
- [ ] Tabla `orders` en D1 + `external_reference`
- [ ] Conciliación email/monto en el webhook + columna “¿coincide email?” en la Sheet
- [ ] Webhook con verificación de firma (código)
- [ ] Guardado en D1 + espejo a Google Sheet (código)
- [ ] Probado con cuenta/tarjetas de prueba de MercadoPago
