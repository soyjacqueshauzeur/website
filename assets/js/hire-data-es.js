/* Catálogo de contratación (ES) — servicios, precios mensuales y textos del carrito.
   Mismo formato que hire-data.js (EN). Traducción espejo; precios y contactos iguales. */
(function (g) {
  g.JH_HIRE = {
    lang: 'es',
    currency: 'USD',
    months: [1, 3, 6, 12],
    whatsapp: '573507402009',
    telegram: 'soyjacqueshauzeur',
    site: 'soyjacqueshauzeur.com',

    services: [
      {
        id: 'marketing',
        file: 'marketing.html',
        num: '01',
        category: 'Marketing',
        price: 497,
        cardTitle: 'Marketing que<br/>trabaja mientras duermes.',
        cardDesc: 'Estrategia de redes, email y contenido para que tus clientes te encuentren solos — sin que tú publiques a ciegas.',
        tags: 'Redes · email · contenido',
        pageTitle: 'Marketing que<br/><span class="lime">aparece</span>, mes<br/>tras mes.',
        pageSub: 'Un hire mensual de marketing para fundadores sin equipo de marketing — o sin tiempo para serlo. Yo manejo los canales que tus clientes sí usan: el mensaje, el calendario y el contenido. Tu negocio sigue apareciendo sin que tú lo persigas.',
        pageMeta: 'Hire mensual · pausa o cancela cuando quieras',
        includes: [
          'Estrategia de audiencia y canales sobre tus clientes reales',
          'Calendario de contenido para redes — escrito, diseñado y publicado',
          'Flujos de email y newsletter que ganan atención',
          'Lectura mensual de los números, sin tecnicismos',
          'Una línea directa conmigo entre sesiones'
        ]
      },
      {
        id: 'campaigns',
        file: 'campaigns.html',
        num: '02',
        category: 'Campañas',
        price: 397,
        cardTitle: 'Campañas con<br/>un número claro.',
        cardDesc: 'Publicidad construida sobre un objetivo, no sobre una corazonada — audiencias, presupuestos y medición que puedes leer a fin de mes.',
        tags: 'Anuncios · medición · embudos',
        pageTitle: 'Anuncios con<br/><span class="lime">un número</span> al<br/>final del mes.',
        pageSub: 'Anuncios que sí puedes leer. Cada campaña se construye sobre un objetivo y un presupuesto, con medición que te dice qué volvió a fin de mes. Configuración, gestión y reportes honestos — sin métricas de vanidad.',
        pageMeta: 'Hire mensual · gestionado de principio a fin',
        includes: [
          'Estrategia de plataformas y audiencias para tu mercado',
          'Creativos y textos de anuncios que hablan al objetivo',
          'Gestión de presupuestos y pujas, semana a semana',
          'Medición de conversiones y embudos',
          'Ads en Meta, Google, TikTok y LinkedIn'
        ]
      },
      {
        id: 'chatbots',
        file: 'chatbots.html',
        num: '03',
        category: 'Chatbots',
        price: 597,
        cardTitle: 'Chatbots que<br/>cierran el círculo.',
        cardDesc: 'Flujos conversacionales que responden, califican y agendan mientras duermes — en los canales que tus clientes ya usan.',
        tags: 'Chat en vivo · mensajeros · reservas',
        pageTitle: 'Chatbots que<br/><span class="lime">responden, califican</span><br/>y agendan.',
        pageSub: 'Un asistente conversacional en los canales que tus clientes ya usan — respondiendo las preguntas repetidas, calificando leads y agendando llamadas mientras duermes. Tú revisas las conversaciones; el bot hace el trabajo pesado.',
        pageMeta: 'Hire mensual · construido y mantenido',
        includes: [
          'Flujos conversacionales para tus preguntas más comunes',
          'Calificación de leads antes de que lleguen a ti',
          'Integración de agenda y reservas',
          'Paso a un humano cuando la respuesta sí te necesita',
          'Ajuste mensual según conversaciones reales'
        ]
      },
      {
        id: 'ai',
        file: 'ai.html',
        num: '04',
        category: 'IA',
        price: 497,
        cardTitle: 'Un asistente que<br/>hace el trabajo, no promesas.',
        cardDesc: 'Responde correos, agenda reuniones y llena tus reportes — horas que recuperas esta misma semana.',
        tags: 'Asistentes · automatizaciones · flujos',
        pageTitle: 'IA que hace<br/><span class="lime">trabajo real</span><br/>esta semana.',
        pageSub: 'IA práctica, no una demo. Asistentes, automatizaciones y flujos montados sobre tu stack real — de los que ahorran horas esta misma semana y que tú puedes operar y modificar.',
        pageMeta: 'Hire mensual · construido sobre tu stack',
        includes: [
          'Auditoría de dónde la IA te ahorra horas reales',
          'Asistentes a medida entrenados con tu negocio',
          'Automatizaciones entre tus herramientas y tu correo',
          'Flujos que tu equipo opera sin mí',
          'Mejora mensual conforme avanzan las herramientas'
        ]
      },
      {
        id: 'money',
        file: 'financial-planning.html',
        num: '05',
        category: 'Planificación financiera',
        price: 197,
        cardTitle: 'El juego de los números.',
        cardDesc: 'Los fundadores casi nunca quiebran por mal producto — quiebran por números a ciegas. Presupuestos, flujo de caja y proyecciones que mantienen la parte del dinero honesta.',
        tags: 'Flujo de caja · presupuestos · proyecciones',
        pageTitle: 'Tu dinero,<br/><span class="lime">con</span><br/>tecnología.',
        pageSub: 'Números que por fin ves. Presupuestos, flujo de caja y proyecciones montados en herramientas que mantienen honesta la parte del dinero — para decidir con claridad, no por corazonada.',
        pageMeta: 'Hire mensual · números que puedes leer',
        includes: [
          'Presupuesto y flujo de caja a tu forma de trabajar',
          'Proyecciones que actualizas en minutos, no en días',
          'Tu economía unitaria real, explicada en simple',
          'Revisión mensual de qué cambiaron los números',
          'Herramientas elegidas para que las sigas operando'
        ]
      },
      {
        id: 'ecommerce',
        file: 'ecommerce.html',
        num: '06',
        category: 'Web y e-commerce',
        price: 397,
        cardTitle: 'Tu web y tu tienda,<br/>listas para vender.',
        cardDesc: 'Webs y e-commerce hechos para convertir — diseño, fichas de producto y analítica que te dicen qué mueve el número.',
        tags: 'Webs · tiendas · analítica',
        pageTitle: 'Tu web y tu tienda,<br/><span class="lime">listas para</span><br/>vender.',
        pageSub: 'Tu web y tu tienda, hechas para vender, no solo para existir. Diseño, fichas de producto, checkout y analítica que te dicen por qué compran — y los cambios que mueven el número cada mes.',
        pageMeta: 'Hire mensual · web + tienda',
        includes: [
          'Web y tienda revisadas — diseño, fichas de producto y checkout',
          'Mejoras de conversión publicadas cada mes',
          'Flujos de email y retención para ventas repetidas',
          'Analítica que explica el porqué, no solo las visitas',
          'Un experimento mensual con resultado claro'
        ]
      }
    ],

    labels: {
      hire: 'Contratar',
      add: 'Contratar',
      priceMonth: '/mes',
      everyMonth: 'cada mes, sin permanencia',
      viewService: 'Ver servicio',
      duration: 'Duración',
      durationPick: '¿Cuántos meses?',
      remove: 'Quitar',
      cartTitle: 'Tu contratación',
      cartOpen: 'Abrir tu contratación',
      bubbleLabel: 'servicios seleccionados',
      empty: 'Aún no has elegido nada — elige un servicio arriba y aparecerá aquí.',
      subTotal: 'Subtotal',
      total: 'Total a pagar',
      approxTotal: 'Aprox. en tu moneda',
      perItem: '/mes',
      billingNote: 'Precios en USD, antes de impuestos. Cuando envías el pedido te respondo con el link de pago por el monto exacto.',
      sendTitle: 'Enviar el pedido',
      paymentTitle: '¿Cómo quieres pagar?',
      paymentNote: 'Elige el medio y envía el pedido — yo confirmo y te mando el link de pago enseguida.',
      wa: 'Enviar pedido por WhatsApp',
      tg: 'Enviar pedido por Telegram',
      waNote: 'Abre WhatsApp con el pedido listo',
      monthWord: 'mes',
      cancel: 'Cerrar',
      continue: 'Seguir mirando',
      added: 'Añadido a tu contratación',
      monthsChips: ['1 mes', '3 meses', '6 meses', '12 meses'],
      min: 'min.',
      youGet: 'Qué recibes cada mes',
      otherServices: 'También puedes contratar',
      otherLede: 'Contrata más de un servicio y llévalos como un solo sistema mensual.',
      hireAnother: 'Combina',
      openCart: 'Revisar y enviar pedido'
    },

    payments: [
      { id: 'mercadopago', label: 'Mercado Pago', note: 'Tarjetas, PSE y pagos locales' },
      { id: 'paypal', label: 'PayPal', note: 'Saldo de PayPal o tarjeta' },
      { id: 'bank', label: 'Transferencia bancaria local', note: 'Depósito directo en tu país' },
      { id: 'other', label: 'Otro / acordamos', note: 'Lo que te funcione' }
    ],

    message: {
      hi: 'Hola Jacques, quiero contratar:',
      line: function (name, months, per, sub) {
        var w = months === 1 ? 'mes' : 'meses';
        return '- ' + name + ' — ' + months + ' ' + w + ' \u00d7 ' + per + '/mes = ' + sub;
      },
      total: 'Total: ',
      payWith: 'Pago con: ',
      sendLink: 'Por favor envíame el link de pago. ¡Gracias!',
      name: 'Nombre: ',
      site: 'Web: '
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
