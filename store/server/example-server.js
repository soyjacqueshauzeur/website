/**
 * store/server/example-server.js
 * -------------------------------------------------------------
 * Backend mínimo de EJEMPLO para la landing (Node.js + Express).
 *
 * Expone:
 *   POST /api/pedido            -> guarda un pedido contra entrega
 *   POST /api/crear-preferencia -> crea una preferencia de MercadoPago (Checkout Pro)
 *   POST /api/webhook/mercadopago -> recibe notificaciones de pago
 *
 * IMPORTANTE:
 *   - El Access Token de MercadoPago vive SOLO aquí (variable de entorno),
 *     NUNCA en el navegador.
 *   - Los pedidos se guardan en un archivo JSON para simplificar el ejemplo.
 *     En producción usa una base de datos.
 *
 * Ejecutar:
 *   npm init -y
 *   npm install express cors mercadopago dotenv
 *   cp .env.example .env   # y rellena los valores
 *   node example-server.js
 * -------------------------------------------------------------
 */

import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), '..'))); // sirve product.html, gracias.html, etc.

const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.resolve(process.cwd(), 'orders.json');

// PERSONALIZAR: credenciales por variables de entorno
const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

/* ---------- utilidades ---------- */
function saveOrder(order) {
  const orders = fs.existsSync(ORDERS_FILE)
    ? JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'))
    : [];
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return order;
}

function validateOrder(body) {
  const required = ['nombre', 'telefono', 'ciudad', 'direccion', 'combo', 'total'];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) return `Campos faltantes: ${missing.join(', ')}`;
  if (!/^\d{7,15}$/.test(String(body.telefono).replace(/\D/g, ''))) return 'Teléfono inválido';
  return null;
}

/* ---------- 1. Pedido contra entrega ---------- */
app.post('/api/pedido', (req, res) => {
  const error = validateOrder(req.body);
  if (error) return res.status(400).json({ ok: false, error });

  const order = saveOrder({
    id: Date.now(),
    tipo: 'contraentrega',
    estado: 'pendiente_confirmacion',
    ...req.body,
    creado: new Date().toISOString(),
  });

  // TODO: notificar por WhatsApp/email/CRM y hacer el pedido al proveedor.
  console.log('Nuevo pedido contra entrega:', order.id);
  res.json({ ok: true, orderId: order.id, redirect: '/gracias.html' });
});

/* ---------- 2. Preferencia de MercadoPago ---------- */
app.post('/api/crear-preferencia', async (req, res) => {
  const error = validateOrder(req.body);
  if (error) return res.status(400).json({ ok: false, error });

  try {
    const order = saveOrder({
      id: Date.now(),
      tipo: 'mercadopago',
      estado: 'pendiente_pago',
      ...req.body,
      creado: new Date().toISOString(),
    });

    const base = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
    const preference = new Preference(mp);

    const result = await preference.create({
      body: {
        items: [{
          title: req.body.combo,                 // ej. "2 × AuraBeam Pro"
          quantity: Number(req.body.qty) || 1,
          unit_price: Number(req.body.total),
          currency_id: 'COP',                    // PERSONALIZAR según país
        }],
        payer: {
          name: req.body.nombre,
          email: req.body.correo || undefined,
        },
        external_reference: String(order.id),
        back_urls: {
          success: `${base}/gracias.html`,
          pending: `${base}/gracias.html`,
          failure: `${base}/pago-fallido.html`,
        },
        auto_return: 'approved',
        notification_url: `${base}/api/webhook/mercadopago`,
      },
    });

    res.json({ ok: true, orderId: order.id, init_point: result.init_point });
  } catch (e) {
    console.error('Error creando preferencia:', e);
    res.status(500).json({ ok: false, error: 'No se pudo crear el pago' });
  }
});

/* ---------- 3. Webhook de MercadoPago ---------- */
app.post('/api/webhook/mercadopago', async (req, res) => {
  try {
    const paymentId = req.query['data.id'] || req.body?.data?.id;
    if (paymentId) {
      const payment = new Payment(mp);
      const info = await payment.get({ id: paymentId });
      console.log('Pago actualizado:', paymentId, info.status, info.external_reference);
      // TODO: actualizar el estado del pedido según info.status (approved/rejected/...)
    }
  } catch (e) {
    console.error('Webhook error:', e);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Servidor de tienda en http://localhost:${PORT}`));
