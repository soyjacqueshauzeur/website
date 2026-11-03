---
title: "Home"
url: /
url_es: /es/
tipo: raiz
tags: [il/hub, il/raiz]
---

# 🏠 Home
`/` · `/es/` · tipo: **raíz**

> [!info] Rol
> Fuente de autoridad del sitio. Reparte a los 4 hubs **y** a los 6 servicios. Hoy solo reparte a hubs: los servicios no reciben ni un enlace desde la home.

## Enlaces salientes (obligatorios)

| Destino | Ancla sugerida | Ubicación |
|---|---|---|
| [[services]] | servicios y tarifas mensuales | hero + CTA medio |
| [[marketing]] | marketing mensual para tu negocio | tarjeta de servicio |
| [[ai]] | automatización e IA aplicada | tarjeta de servicio |
| [[chatbots]] | chatbots de WhatsApp que venden | tarjeta de servicio |
| [[campaigns]] | campañas de pago gestionadas | tarjeta de servicio |
| [[ecommerce]] | tienda online que convierte | tarjeta de servicio |
| [[financial-planning]] | planificación financiera | tarjeta de servicio |
| [[sessions]] | sesión 1:1 | sección 1:1 |
| [[clients]] | clientes | sección clientes |
| [[blog-listing]] | blog | sección journal |
| [[ia-en-el-trabajo]] | la IA en el trabajo | journal (3 últimos, estático) |
| [[webs-2026]] | por qué tu negocio necesita una web | journal |
| [[chat-marketing]] | chat marketing | journal |

## Enlaces entrantes
Todas las páginas (logo + nav + breadcrumb). No hay que gestionarlo.

## Cambios en la web

1. **La sección de servicios es JS** (`hire-data.js`): el crawler ve "Monthly services I offer" sin enlaces. Renderizar las 6 tarjetas en HTML estático, cada una enlazando a su página.
2. **El journal es JS** (`journal-latest.js`): los 3 últimos posts no existen como enlaces en el HTML. Servirlos estáticos.
3. Borrar el copy de fotografía del bloque journal ("lighting setup", "colour management", "frames we kept"). Confunde el tema del sitio — ver la auditoría de Search Console.
4. La home enlaza 4 veces a sí misma (`href="index.html"`) desde el nav. Corregir a `/`.
