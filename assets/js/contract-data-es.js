/* Contratos de servicio (ES) — texto base editable, basado en
   Contrato_Prestacion_Servicios_Plantilla.docx.
   Fuente única del contrato que se genera en <servicio>-hire.html y contrato.html.
   Tokens: {{provider}} {{providerId}} {{providerDomicile}} {{site}} {{providerEmail}}
   {{providerWhatsapp}} {{fullName}} {{company}} {{idNumber}} {{country}} {{address}}
   {{email}} {{whatsapp}} {{service}} {{price}} {{duration}} {{day}} {{monthName}}
   {{year}} {{date}}. Edita libremente los párrafos. */
(function (g) {
  g.JH_CONTRACT = {
    lang: 'es',

    provider: {
      name: 'Jacques Hauzeur',
      id: '',
      domicile: 'Colombia',
      site: 'soyjacqueshauzeur.com',
      email: 'yhauzeur@gmail.com',
      whatsapp: '+573507402009',
      telegram: 'https://t.me/soyjacqueshauzeur'
    },

    labels: {
      formEyebrow: 'Contrato de servicio',
      formTitle: 'Genera tu contrato',
      formLede: 'Completa los campos marcados con * y el contrato se irá completando con tus datos.',
      fullName: 'Nombre completo o razón social',
      company: 'Empresa (opcional)',
      idNumber: 'Identificación — cédula / NIT / pasaporte (opcional)',
      whatsapp: 'Teléfono WhatsApp',
      country: 'País',
      address: 'Dirección (opcional)',
      email: 'Email',
      duration: 'Duración',
      durationWords: { 1: '1 mes', 3: '3 meses', 6: '6 meses', 12: '12 meses' },
      generate: 'Ver contrato',
      print: 'Imprimir / Guardar PDF',
      previewLabel: 'Vista previa',
      requiredNote: 'Los campos con * son obligatorios.',
      errRequired: 'Este campo es obligatorio.',
      errEmail: 'Escribe un email válido.',
      errPhone: 'Escribe un WhatsApp válido (solo números, con código de país).',
      downloadOne: 'Descargar contrato',
      downloadAll: 'Descargar todos',
      yourData: 'Tus datos',
      editData: 'Editar datos'
    },

    clauses: {
      title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS',
      subtitle: 'SERVICIO: {{service}}',
      intro: 'Entre las partes que se identifican a continuación se celebra el presente contrato de prestación de servicios (en adelante, «el Contrato»), el cual se regirá por las cláusulas que se enuncian más abajo.',
      providerTitle: 'EL PRESTADOR',
      providerFields: [
        ['Nombre', '{{provider}}'],
        ['Identificación (Cédula de Ciudadanía / NIT)', '{{providerId}}'],
        ['Domicilio', '{{providerDomicile}}'],
        ['Sitio web', '{{site}}'],
        ['Correo electrónico', '{{providerEmail}}'],
        ['WhatsApp', '{{providerWhatsapp}}'],
        ['Telegram', '{{providerTelegram}}']
      ],
      providerConstitutes: 'En adelante, «el Prestador», quien actúa en nombre propio como prestador de servicios independiente.',
      clientTitle: 'EL CLIENTE',
      clientFields: [
        ['Nombre completo o razón social', '{{fullName}}'],
        ['Empresa', '{{company}}'],
        ['Identificación (Cédula / NIT / Pasaporte)', '{{idNumber}}'],
        ['País de domicilio', '{{country}}'],
        ['Dirección', '{{address}}'],
        ['Correo electrónico', '{{email}}'],
        ['WhatsApp / Teléfono', '{{whatsapp}}']
      ],
      clientConstitutes: 'En adelante, «el Cliente». El Prestador y el Cliente se denominarán conjuntamente «las Partes».',
      sections: [
        { h: 'PRIMERA. OBJETO', p: 'El Prestador se obliga a prestar al Cliente, de forma independiente y sin relación de subordinación, el servicio mensual de «{{service}}», bajo la modalidad de contratación mensual, conforme al alcance detallado en la Cláusula Segunda.' },
        { h: 'SEGUNDA. ALCANCE DEL SERVICIO', p: 'El alcance del servicio comprende las siguientes actividades:', scope: true, outro: 'Cualquier actividad, entregable o canal no listado expresamente en esta cláusula se entenderá fuera del alcance del servicio y, de ser requerido por el Cliente, deberá acordarse por separado y podrá implicar un ajuste en el precio.' },
        { h: 'TERCERA. NATURALEZA DE LA RELACIÓN', p: 'El presente Contrato se celebra bajo la modalidad de prestación de servicios profesionales independientes, en los términos del Código Civil y del Código de Comercio de Colombia. En consecuencia, no genera relación laboral, ni vínculo de subordinación o dependencia entre las Partes, ni derecho alguno a prestaciones sociales, y el Prestador conserva plena autonomía técnica, administrativa y de horario para la ejecución del servicio. El Prestador podrá prestar servicios similares a otros clientes, salvo pacto expreso de exclusividad.' },
        { h: 'CUARTA. VIGENCIA Y CANCELACIÓN', p: 'El presente Contrato entra en vigor en la fecha de firma y tiene una vigencia inicial de {{duration}}, renovable automáticamente por períodos iguales salvo aviso en contrario. No obstante lo anterior, el servicio se contrata sin permanencia mínima: el Cliente podrá pausar o cancelar el servicio en cualquier momento, mediante aviso escrito (correo electrónico o WhatsApp) con una antelación mínima de quince (15) días respecto del siguiente ciclo de facturación, sin penalización alguna. La cancelación no exime al Cliente del pago de los servicios ya prestados o del mes en curso.' },
        { h: 'QUINTA. PRECIO', p: 'El precio acordado es de {{price}} (dólares estadounidenses) por mes, valor que no incluye impuestos. El servicio se factura y se paga mes a mes, por adelantado, salvo que las Partes acuerden algo distinto por escrito. Para clientes cuyo pago se realice en una moneda distinta al dólar estadounidense, la conversión se hará a la tasa de cambio (TRM u otra de referencia) vigente en la fecha de facturación.' },
        { h: 'SEXTA. FORMA DE PAGO, FACTURACIÓN E IMPUESTOS', p: 'El Cliente realizará el pago a través del medio acordado con el Prestador — Mercado Pago, PayPal, Wise o transferencia bancaria local o internacional. El Prestador enviará el enlace o los datos de pago correspondientes al confirmar cada ciclo de facturación. En caso de mora en el pago superior a cinco (5) días hábiles, el Prestador podrá suspender la prestación del servicio hasta que se regularice el pago, sin que ello genere responsabilidad para el Prestador. Cada Parte será responsable de sus propias obligaciones tributarias derivadas del presente Contrato, incluyendo las retenciones en la fuente que resulten aplicables conforme a la legislación de su país de domicilio.' },
        { h: 'SÉPTIMA. CONFIDENCIALIDAD', p: 'Ambas Partes se obligan a tratar como confidencial toda la información sensible, comercial, técnica o financiera a la que tengan acceso con ocasión del presente Contrato, y a no divulgarla a terceros sin autorización previa y por escrito de la otra Parte, salvo requerimiento de autoridad competente. Esta obligación permanecerá vigente durante la ejecución del Contrato y por un período de dos (2) años después de su terminación.' },
        { h: 'OCTAVA. PROTECCIÓN DE DATOS PERSONALES', p: 'El Prestador tratará los datos personales suministrados por el Cliente, o por los usuarios de este, exclusivamente para los fines de la ejecución del presente Contrato, conforme a lo dispuesto en la Ley 1581 de 2012 y sus decretos reglamentarios, y, cuando el Cliente o sus usuarios se encuentren en otras jurisdicciones, conforme a la normativa de protección de datos que resulte aplicable (p. ej. el Reglamento General de Protección de Datos — RGPD/GDPR — para clientes en la Unión Europea). El Prestador implementará medidas razonables de seguridad para proteger dicha información y no la utilizará para fines distintos a los aquí previstos.' },
        { h: 'NOVENA. PROPIEDAD INTELECTUAL', p: 'El Cliente conserva la titularidad de sus marcas, contenidos, datos e información suministrada al Prestador. El Prestador conserva la titularidad de sus propias metodologías, plantillas, procesos y herramientas de trabajo, incluso cuando estas se empleen en la ejecución del servicio. Los entregables creados específicamente para el Cliente en desarrollo del presente Contrato quedarán a su disposición y uso una vez hayan sido pagados en su totalidad los valores correspondientes; hasta entonces, el Prestador conserva los derechos sobre dichos entregables.' },
        { h: 'DÉCIMA. LIMITACIÓN DE RESPONSABILIDAD', p: 'El Prestador ejecutará el servicio con la diligencia y el cuidado profesional razonables, pero no garantiza resultados específicos de negocio (ventas, crecimiento de audiencia, posicionamiento, etc.), dado que estos dependen de factores externos ajenos a su control. En ningún caso la responsabilidad del Prestador frente al Cliente por daños derivados del presente Contrato excederá el valor total pagado por el Cliente durante los tres (3) meses anteriores al hecho que origina el reclamo, salvo en los casos de dolo o culpa grave.' },
        { h: 'DÉCIMA PRIMERA. FUERZA MAYOR', p: 'Ninguna de las Partes será responsable por el incumplimiento o retraso en sus obligaciones cuando este obedezca a caso fortuito o fuerza mayor, entendido como todo hecho imprevisible o irresistible ajeno a su voluntad, mientras dicha situación persista.' },
        { h: 'DÉCIMA SEGUNDA. TERMINACIÓN', p: 'Además de la facultad de cancelación prevista en la Cláusula Cuarta, cualquiera de las Partes podrá dar por terminado el presente Contrato de forma anticipada, sin necesidad de declaración judicial, en caso de incumplimiento grave de la otra Parte que no sea subsanado dentro de los diez (10) días siguientes al requerimiento escrito. En cualquier caso de terminación, el Prestador entregará al Cliente el trabajo realizado hasta la fecha y el Cliente pagará las sumas adeudadas por servicios ya prestados.' },
        { h: 'DÉCIMA TERCERA. LEY APLICABLE Y RESOLUCIÓN DE CONTROVERSIAS', p: 'El presente Contrato se regirá e interpretará conforme a las leyes de la República de Colombia, con independencia del país de domicilio del Cliente. Toda controversia derivada del Contrato que no pueda resolverse mediante acuerdo directo entre las Partes dentro de un plazo de treinta (30) días será sometida, a elección del Prestador, a la jurisdicción de los jueces competentes de Bogotá D.C., Colombia, o a arbitraje conforme al reglamento del centro de arbitraje que las Partes acuerden.' },
        { h: 'DÉCIMA CUARTA. NOTIFICACIONES', p: 'Toda comunicación o notificación relacionada con el presente Contrato se entenderá válidamente efectuada si se realiza por correo electrónico o WhatsApp a las direcciones y números indicados al inicio de este documento, o a los que las Partes se notifiquen posteriormente por escrito.' },
        { h: 'DÉCIMA QUINTA. DISPOSICIONES GENERALES', p: 'Este Contrato, junto con sus anexos si los hubiere, constituye el acuerdo íntegro entre las Partes respecto de su objeto y deja sin efecto cualquier acuerdo o entendimiento previo, verbal o escrito, sobre la misma materia. Cualquier modificación deberá constar por escrito y ser suscrita por ambas Partes. Ninguna de las Partes podrá ceder los derechos u obligaciones derivados de este Contrato sin el consentimiento previo y escrito de la otra. Si alguna cláusula de este Contrato fuere declarada inválida o inejecutable, las demás conservarán plena vigencia.' }
      ],
      scopeTitle: 'Alcance del servicio',
      noteTitle: 'Detalle del servicio',
      close: 'En señal de conformidad, las Partes suscriben el presente Contrato online, a los {{day}} días del mes de {{monthName}} de {{year}}.',
      providerSign: 'EL PRESTADOR',
      clientSign: 'EL CLIENTE',
      disclaimer: 'Nota: este documento es una plantilla base y no constituye asesoría legal. Se recomienda revisión por un abogado, especialmente para clientes en jurisdicciones fuera de Colombia.',
      docAria: 'Contrato de prestación de servicios'
    },

    services: {
      marketing: { note: 'El alcance mensual incluye estrategia de audiencia y canales, calendario de contenido para redes, flujos de email y una lectura mensual de los números.' },
      campaigns: { note: 'El alcance mensual incluye estrategia de plataformas y audiencias, creativos y textos de anuncios, gestión de presupuestos y pujas, medición de conversiones y embudos, y un reporte mensual.' },
      chatbots: { note: 'El alcance mensual incluye flujos conversacionales, calificación de leads, integración de agenda y reservas, y ajuste mensual según conversaciones reales.' },
      ai: { note: 'El alcance mensual incluye auditoría de oportunidades, asistentes a medida entrenados con el negocio, automatizaciones y flujos que el equipo puede operar.' },
      money: { note: 'El alcance mensual incluye presupuesto y flujo de caja, proyecciones actualizables en minutos, economía unitaria real y una revisión mensual de los números.' },
      ecommerce: { note: 'El alcance mensual incluye revisión de la web y la tienda, mejoras de conversión, flujos de email y retención, analítica y un experimento mensual con resultado claro.' }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
