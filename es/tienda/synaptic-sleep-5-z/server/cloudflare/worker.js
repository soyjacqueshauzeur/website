/**
 * Cloudflare Worker — backend GENÉRICO de MercadoPago para una web estática
 * (GitHub Pages). Soporta VARIAS áreas: tienda, 1:1 y servicios.
 *
 * El secreto (MP_ACCESS_TOKEN) vive SOLO aquí, como variable de entorno.
 * El navegador nunca lo ve: solo recibe el `init_point`.
 *
 * Los precios salen del catálogo del servidor (`catalog.json`), nunca del
 * navegador: el cliente solo manda { area, items:[{id,qty}] }.
 *
 * Rutas:
 *   GET  /                       -> health check
 *   GET  /catalogo[?area=x]      -> catálogo público (ids, títulos, precios)
 *   POST /crear-preferencia      -> pago único (Checkout Pro)
 *   POST /crear-suscripcion      -> suscripción mensual (preapproval)
 *   POST /webhook/mercadopago    -> notificaciones de pago (responde 200 rápido)
 *
 * Desplegar:
 *   npm i -g wrangler && wrangler login
 *   wrangler secret put MP_ACCESS_TOKEN
 *   wrangler deploy
 *
 * Opcional — persistir pagos (recomendado): crear un KV y descomentar el binding
 * `[[kv_namespaces]]` en wrangler.toml. El webhook guardará ahí cada pago.
 */

import catalog from './catalog.json';

const ACCOUNT_CURRENCY = catalog.accountCurrency || 'COP';
const AREAS = catalog.areas || {};
const FX = catalog.fx || {};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/') {
        return json({ ok: true, service: 'mercadopago-checkout', areas: Object.keys(AREAS) }, 200, origin);
      }
      if (request.method === 'GET' && url.pathname === '/catalogo') {
        return json({ ok: true, currency: ACCOUNT_CURRENCY, catalog: publicCatalog(url.searchParams.get('area')) }, 200, origin);
      }
      if (request.method === 'POST' && url.pathname === '/crear-preferencia') {
        return await crearPreferencia(request, env, url, origin);
      }
      if (request.method === 'POST' && url.pathname === '/crear-suscripcion') {
        return await crearSuscripcion(request, env, url, origin);
      }
      if (url.pathname === '/webhook/mercadopago') {
        return await webhook(request, env, ctx, origin);
      }
      return json({ ok: false, error: 'Not found' }, 404, origin);
    } catch (e) {
      return json({ ok: false, error: 'Error interno' }, 500, origin);
    }
  }
};

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
    'Access-Control-Max-Age': '86400'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) }
  });
}

function publicArea(name) {
  const a = AREAS[name];
  return {
    area: name,
    items: (a.items || []).map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      currency: p.currency || ACCOUNT_CURRENCY,
      image: p.image || null
    }))
  };
}

function publicCatalog(area) {
  if (area) return AREAS[area] ? [publicArea(area)] : [];
  return Object.keys(AREAS).map(publicArea);
}

/* Tasa de cambio hacia la moneda de la cuenta (USD -> COP por defecto). */
async function rateToAccount(env, from) {
  if (from === ACCOUNT_CURRENCY) return 1;
  if (from === 'USD' && ACCOUNT_CURRENCY === 'COP') {
    if (env.USD_COP) return Number(env.USD_COP);
    try {
      const r = await fetch('https://api.frankfurter.dev/v2/rates?base=USD&quotes=COP');
      const d = await r.json();
      const v = d && d.rates && d.rates.COP;
      if (v) return Number(v);
    } catch (e) { /* usa fallback */ }
    return Number(FX.USD) || 4000;
  }
  return 1;
}

/* Resuelve { items:[{id,qty}] } contra el catálogo del área (precios del server). */
async function resolveItems(env, area, rawItems) {
  const cfg = AREAS[area];
  if (!cfg) return { error: `Área desconocida: ${area}` };
  if (!Array.isArray(rawItems) || rawItems.length === 0) return { error: 'El carrito está vacío (items).' };

  const byId = new Map((cfg.items || []).map((p) => [p.id, p]));
  const items = [];
  let total = 0;

  for (const raw of rawItems) {
    const product = byId.get(String(raw && raw.id));
    if (!product) return { error: `Producto desconocido en ${area}: ${raw && raw.id}` };

    const qty = Number(raw.qty) || 1;
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return { error: `Cantidad inválida para ${product.id}.` };
    }

    const from = product.currency || ACCOUNT_CURRENCY;
    const rate = await rateToAccount(env, from);
    const unit = Math.round(Number(product.price) * rate);

    items.push({
      id: product.id,
      title: String(product.title),
      quantity: qty,
      unit_price: unit,
      currency_id: ACCOUNT_CURRENCY,
      picture_url: product.image || undefined
    });
    total += unit * qty;
  }

  return { items, total };
}

function safePath(p, fallback) {
  return typeof p === 'string' && p.startsWith('/') ? p : fallback;
}

function idempotencyKey(request, body) {
  return (
    request.headers.get('X-Idempotency-Key') ||
    (body && body.idempotencyKey) ||
    (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
  );
}

async function crearPreferencia(request, env, url, origin) {
  const body = await request.json().catch(() => null);
  const area = body && body.area ? String(body.area) : null;
  if (!area) return json({ ok: false, error: 'Falta el área (area).' }, 400, origin);

  const cfg = AREAS[area];
  if (!cfg) return json({ ok: false, error: `Área desconocida: ${area}` }, 400, origin);

  const resolved = await resolveItems(env, area, body.items);
  if (resolved.error) return json({ ok: false, error: resolved.error }, 400, origin);

  const base = (env.PUBLIC_BASE_URL || url.origin).replace(/\/$/, '');
  const orderId = `${area}-${Date.now()}`;
  const payer = body.payer || {};
  const success = safePath(body.back, cfg.success);
  const failure = safePath(body.backFail, cfg.failure);

  const preference = {
    items: resolved.items.map(({ id, ...rest }) => rest),
    payer: { name: payer.name || undefined, email: payer.email || undefined },
    external_reference: orderId,
    back_urls: {
      success: `${base}${success}`,
      pending: `${base}${safePath(cfg.pending || cfg.success, success)}`,
      failure: `${base}${failure}`
    },
    auto_return: 'approved',
    notification_url: `${url.origin}/webhook/mercadopago`
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey(request, body)
    },
    body: JSON.stringify(preference)
  });
  const data = await res.json();

  if (!res.ok) return json({ ok: false, error: data.message || 'No se pudo crear el pago' }, 502, origin);
  return json(
    { ok: true, area, orderId, total: resolved.total, currency: ACCOUNT_CURRENCY, id: data.id, init_point: data.init_point },
    200,
    origin
  );
}

/* Suscripción mensual (preapproval) — pensada para `services` (hire mensual). */
async function crearSuscripcion(request, env, url, origin) {
  const body = await request.json().catch(() => null);
  const area = body && body.area ? String(body.area) : null;
  const cfg = area ? AREAS[area] : null;
  if (!cfg) return json({ ok: false, error: `Área desconocida: ${area}` }, 400, origin);

  const payer = body.payer || {};
  if (!payer.email) return json({ ok: false, error: 'La suscripción necesita payer.email.' }, 400, origin);

  // Importe recurrente = suma de precios mensuales de los servicios elegidos (qty = 1 c/u).
  const resolved = await resolveItems(env, area, (body.items || []).map((it) => ({ id: it.id, qty: 1 })));
  if (resolved.error) return json({ ok: false, error: resolved.error }, 400, origin);

  const base = (env.PUBLIC_BASE_URL || url.origin).replace(/\/$/, '');
  const back = safePath(body.back, cfg.success);

  const preapproval = {
    reason: body.reason || String(resolved.items[0].title),
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: resolved.total,
      currency_id: ACCOUNT_CURRENCY
    },
    payer_email: payer.email,
    back_url: `${base}${back}`,
    status: 'pending'
  };

  const res = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey(request, body)
    },
    body: JSON.stringify(preapproval)
  });
  const data = await res.json();

  if (!res.ok) return json({ ok: false, error: data.message || 'No se pudo crear la suscripción' }, 502, origin);
  return json(
    { ok: true, area, total: resolved.total, currency: ACCOUNT_CURRENCY, id: data.id, init_point: data.init_point },
    200,
    origin
  );
}

/* Webhook: responde 200 al instante y procesa en segundo plano (ctx.waitUntil). */
async function webhook(request, env, ctx, origin) {
  const url = new URL(request.url);
  let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id');
  let topic = url.searchParams.get('type') || url.searchParams.get('topic');
  if (!paymentId && request.method === 'POST') {
    const body = await request.json().catch(() => null);
    paymentId = body?.data?.id || body?.id || null;
    topic = topic || body?.type || null;
  }

  const ack = json({ ok: true }, 200, origin);
  if (!paymentId) return ack;

  const task = processNotification(env, paymentId, topic);
  if (ctx && typeof ctx.waitUntil === 'function') { ctx.waitUntil(task); return ack; }
  await task;
  return ack;
}

async function processNotification(env, paymentId, topic) {
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
    });
    if (!res.ok) { console.log('webhook payment fetch failed', paymentId, res.status); return; }

    const p = await res.json();
    const record = {
      id: p.id,
      status: p.status,
      status_detail: p.status_detail,
      external_reference: p.external_reference,
      payment_method: p.payment_method_id,
      payment_type: p.payment_type_id,
      transaction_amount: p.transaction_amount,
      currency_id: p.currency_id,
      date_created: p.date_created,
      payer_email: p.payer && p.payer.email
    };
    console.log('payment', JSON.stringify(record));

    // Persistencia opcional: si hay un KV `PAYMENTS` enlazado, guarda el pago.
    if (env.PAYMENTS && typeof env.PAYMENTS.put === 'function') {
      await env.PAYMENTS.put(String(paymentId), JSON.stringify(record));
    }
    // TODO producción: actualizar el pedido/usuario en tu base de datos (D1/Supabase…).
  } catch (e) {
    console.log('webhook error', String(e));
  }
}
