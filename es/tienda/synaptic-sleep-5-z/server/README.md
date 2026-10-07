# store/ — Tienda de producto (DEMO)

Versión de prueba de la landing de producto única, con la estructura optimizada
para conversión. **No** es producto real: textos, precios, reseñas e imágenes son
de ejemplo.

## Archivos

| Archivo | Qué es |
|---|---|
| `product.html` | Landing de producto optimizada (autocontenida: CSS + JS). |
| `gracias.html` | Confirmación tras pedido contra entrega (lee `sessionStorage['jh-order']`). |
| `pago-fallido.html` | Página de pago rechazado / cancelado. |
| `server/example-server.js` | Backend de ejemplo (Express + MercadoPago). |
| `server/.env.example` | Variables de entorno de ejemplo. |

## Cambios estructurales aplicados (vs. la versión base)

1. **Buy-box temprano**: precio + combos + CTA + confianza arriba del pliegue.
2. **Formulario en 2 pasos** (nombre/WhatsApp/ciudad → entrega/pago) + pedido por WhatsApp.
3. **Micro-confianza y logos de pago** junto al CTA.
4. **Bundle por defecto = 2 unidades** (“★ Más elegido”); 3 = “Mejor precio”.
5. **Urgencia honesta**: el contador solo se muestra si defines una fecha real.
6. **Prueba social temprana** (UGC + rating) y **micro-objeciones** antes de la oferta.
7. **Progressive enhancement**: el contenido se ve aunque falle el JS (la animación solo se añade con JS).
8. **SEO estructurado**: JSON-LD `Product` + `Offer` + `FAQPage`, `preload` del hero, `width/height` en imágenes.
9. **Píxeles**: base para Meta/TikTok/GA en el aceptar cookies (punto marcado para inicializar).

## Personalizar (buscar en el HTML)

- `PERSONALIZAR` / `PENDIENTE` en `product.html`.
- En `product.html <script>`: `WHATSAPP_NUMBER`, `OFFER_END`, `CHECKOUT_URL`.
- Imágenes: reemplazar `placehold.co` por tus WebP autohospedados.
- Logo/paleta: ya usa los tokens de `assets/css/styles.css` (lima `#D4FF3D`, fondos ink, Boldonse / Inter Tight / Geist Mono).

## Backend y pagos (MercadoPago)

```bash
cd server
npm init -y
npm install express cors mercadopago dotenv
cp .env.example .env      # rellena MP_ACCESS_TOKEN
node example-server.js    # sirve la web y expone /api/*
```

### Conectar el formulario al backend
En `product.html`, dentro del `submit`, reemplaza el bloque de demo:

```js
// Contra entrega
await fetch('/api/pedido', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
window.location.href = 'gracias.html';

// MercadoPago
const r = await fetch('/api/crear-preferencia', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
}).then((x) => x.json());
window.location.href = r.init_point;   // Checkout Pro
```

### Probar pagos en sandbox
1. Crea una aplicación en https://www.mercadopago.com.co/developers y copia el
   **Access Token de prueba**.
2. Usa las **tarjetas de prueba** de MercadoPago (APRO / OTHE / CALL) para simular
   pago aprobado, rechazado y pendiente.
3. Configura `PUBLIC_BASE_URL` con una URL pública (ngrok) para que llegue el
   webhook: `https://.../api/webhook/mercadopago`.

### Seguridad
- El `MP_ACCESS_TOKEN` **nunca** va en el navegador.
- Valida y sanea todo en el servidor (el ejemplo hace una validación básica).
- Usa una base de datos en producción (el ejemplo guarda en `orders.json`).

## Publicar
- Sirve los archivos estáticos (Netlify/Vercel/Cloudflare Pages) y el backend
  aparte (Railway/Fly/Render o funciones serverless), o todo junto con Express.
- Cambia `noindex, nofollow` por tus metas reales y actualiza el dominio en
  `og:image`, JSON-LD y `PUBLIC_BASE_URL`.
