/* Service contracts (EN) — editable base text, based on
   Contrato_Prestacion_Servicios_Plantilla.docx.
   Single source for the contract generated at <service>-hire.html and contract.html.
   Tokens: {{provider}} {{providerId}} {{providerDomicile}} {{site}} {{providerEmail}}
   {{providerWhatsapp}} {{fullName}} {{company}} {{idNumber}} {{country}} {{address}}
   {{email}} {{whatsapp}} {{service}} {{price}} {{duration}} {{day}} {{monthName}}
   {{year}} {{date}}. Edit the paragraphs freely. */
(function (g) {
  g.JH_CONTRACT = {
    lang: 'en',

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
      formEyebrow: 'Service contract',
      formTitle: 'Generate your contract',
      formLede: 'Fill in the fields marked with * and the contract will fill in with your details.',
      fullName: 'Full name or company name',
      company: 'Company (optional)',
      idNumber: 'Identification — ID / Tax ID / Passport (optional)',
      whatsapp: 'WhatsApp phone',
      country: 'Country',
      address: 'Address (optional)',
      email: 'Email',
      duration: 'Duration',
      durationWords: { 1: '1 month', 3: '3 months', 6: '6 months', 12: '12 months' },
      generate: 'View contract',
      print: 'Print / Save as PDF',
      previewLabel: 'Preview',
      requiredNote: 'Fields marked with * are required.',
      errRequired: 'This field is required.',
      errEmail: 'Enter a valid email.',
      errPhone: 'Enter a valid WhatsApp number (digits only, with country code).',
      downloadOne: 'Download contract',
      downloadAll: 'Download all',
      yourData: 'Your details',
      editData: 'Edit details'
    },

    clauses: {
      title: 'SERVICE AGREEMENT',
      subtitle: 'SERVICE: {{service}}',
      intro: 'The parties identified below enter into this service agreement (hereinafter, "the Agreement"), which shall be governed by the clauses set out below.',
      providerTitle: 'THE PROVIDER',
      providerFields: [
        ['Name', '{{provider}}'],
        ['Identification (Citizenship ID / Tax ID)', '{{providerId}}'],
        ['Domicile', '{{providerDomicile}}'],
        ['Website', '{{site}}'],
        ['Email', '{{providerEmail}}'],
        ['WhatsApp', '{{providerWhatsapp}}'],
        ['Telegram', '{{providerTelegram}}']
      ],
      providerConstitutes: 'Hereinafter, "the Provider", acting in its own name as an independent service provider.',
      clientTitle: 'THE CLIENT',
      clientFields: [
        ['Full name or company name', '{{fullName}}'],
        ['Company', '{{company}}'],
        ['Identification (ID / Tax ID / Passport)', '{{idNumber}}'],
        ['Country of domicile', '{{country}}'],
        ['Address', '{{address}}'],
        ['Email', '{{email}}'],
        ['WhatsApp / Phone', '{{whatsapp}}']
      ],
      clientConstitutes: 'Hereinafter, "the Client". The Provider and the Client shall be jointly referred to as "the Parties".',
      sections: [
        { h: 'FIRST. PURPOSE', p: 'The Provider undertakes to deliver to the Client, independently and without any subordination, the monthly service of "{{service}}", on a monthly engagement, as described in the scope set out in Clause Two.' },
        { h: 'SECOND. SCOPE OF THE SERVICE', p: 'The scope of the service comprises the following activities:', scope: true, outro: 'Any activity, deliverable or channel not expressly listed in this clause shall be deemed outside the scope of the service and, if required by the Client, must be agreed separately and may involve a price adjustment.' },
        { h: 'THIRD. NATURE OF THE RELATIONSHIP', p: 'This Agreement is entered into as an independent professional services engagement, under the terms of the Civil Code and the Commercial Code of Colombia. Accordingly, it does not create an employment relationship, subordination or dependency between the Parties, nor any right to social benefits, and the Provider retains full technical, administrative and schedule autonomy in performing the service. The Provider may provide similar services to other clients, unless expressly agreed otherwise.' },
        { h: 'FOURTH. TERM AND CANCELLATION', p: 'This Agreement takes effect on the date of signature and has an initial term of {{duration}}, automatically renewable for equal periods unless notice is given to the contrary. Notwithstanding the foregoing, the service is contracted with no minimum commitment: the Client may pause or cancel the service at any time, by written notice (email or WhatsApp) at least fifteen (15) days before the next billing cycle, with no penalty. Cancellation does not relieve the Client of payment for services already provided or for the current month.' },
        { h: 'FIFTH. PRICE', p: 'The agreed price is {{price}} (US dollars) per month, which does not include taxes. The service is invoiced and paid month by month, in advance, unless the Parties agree otherwise in writing. For clients paying in a currency other than the US dollar, conversion shall be made at the exchange rate (TRM or another reference) in effect on the billing date. Service prices may be changed without prior notice; the Client shall be responsible for accepting the price in effect for the renewal of each agreement.', price: true },
        { h: 'SIXTH. PAYMENT, INVOICING AND TAXES', p: 'The Client shall pay through the method agreed with the Provider — Mercado Pago, PayPal, Wise or a local or international bank transfer. The Provider will send the corresponding payment link or details upon confirming each billing cycle. In the event of payment delay exceeding five (5) business days, the Provider may suspend the service until payment is settled, without liability to the Provider. Each Party shall be responsible for its own tax obligations arising from this Agreement, including any applicable withholding taxes under the laws of its country of domicile.' },
        { h: 'SEVENTH. CONFIDENTIALITY', p: 'Both Parties undertake to treat as confidential all sensitive, commercial, technical or financial information to which they have access in connection with this Agreement, and not to disclose it to third parties without the prior written consent of the other Party, except where required by a competent authority. This obligation shall remain in force during the term of the Agreement and for two (2) years after its termination.' },
        { h: 'EIGHTH. PERSONAL DATA PROTECTION', p: 'The Provider shall process the personal data provided by the Client, or by the Client\'s users, exclusively for the purposes of performing this Agreement, in accordance with Law 1581 of 2012 and its implementing decrees and, where the Client or its users are located in other jurisdictions, in accordance with the applicable data protection regulations (e.g. the General Data Protection Regulation — GDPR — for clients in the European Union). The Provider shall implement reasonable security measures to protect such information and shall not use it for purposes other than those set out herein.' },
        { h: 'NINTH. INTELLECTUAL PROPERTY', p: 'The Client retains ownership of its brands, content, data and information provided to the Provider. The Provider retains ownership of its own methodologies, templates, processes and work tools, even when used in performing the service. Deliverables created specifically for the Client under this Agreement shall be made available for the Client\'s use once the corresponding amounts have been paid in full; until then, the Provider retains the rights over such deliverables.' },
        { h: 'TENTH. LIMITATION OF LIABILITY', p: 'The Provider shall perform the service with reasonable professional diligence and care, but does not guarantee specific business results (sales, audience growth, positioning, etc.), as these depend on external factors beyond its control. In no event shall the Provider\'s liability to the Client for damages arising from this Agreement exceed the total amount paid by the Client during the three (3) months preceding the event giving rise to the claim, except in cases of willful misconduct or gross negligence.' },
        { h: 'ELEVENTH. FORCE MAJEURE', p: 'Neither Party shall be liable for failure or delay in performing its obligations where caused by an unforeseeable or irresistible event beyond its control, for as long as such situation persists.' },
        { h: 'TWELFTH. TERMINATION', p: 'In addition to the cancellation right set out in Clause Four, either Party may terminate this Agreement early, without judicial declaration, in the event of a material breach by the other Party that is not remedied within ten (10) days of written notice. In any case of termination, the Provider shall hand over the work done to date and the Client shall pay the amounts owed for services already provided.' },
        { h: 'THIRTEENTH. GOVERNING LAW AND DISPUTE RESOLUTION', p: 'This Agreement shall be governed by and construed in accordance with the laws of the Republic of Colombia, regardless of the Client\'s country of domicile. Any dispute arising from the Agreement that cannot be resolved by direct agreement between the Parties within thirty (30) days shall be submitted, at the Provider\'s choice, to the jurisdiction of the competent courts of Bogotá D.C., Colombia, or to arbitration under the rules of the arbitration center agreed by the Parties.' },
        { h: 'FOURTEENTH. NOTICES', p: 'Any communication or notice relating to this Agreement shall be validly made if sent by email to the addresses indicated at the beginning of this document, or to those later notified in writing by the Parties.' },
        { h: 'FIFTEENTH. GENERAL PROVISIONS', p: 'This Agreement, together with any annexes, constitutes the entire agreement between the Parties regarding its subject matter and supersedes any prior agreement or understanding, whether verbal or written, on the same matter. Any amendment must be in writing and signed by both Parties. Neither Party may assign the rights or obligations arising from this Agreement without the prior written consent of the other. If any clause of this Agreement is declared invalid or unenforceable, the remaining clauses shall remain in full force.' }
      ],
      scopeTitle: 'Scope of the service',
      noteTitle: 'Service details',
      close: 'In witness whereof, the Parties sign this Agreement online, on {{monthName}} {{day}}, {{year}}.',
      providerSign: 'THE PROVIDER',
      clientSign: 'THE CLIENT',
      disclaimer: 'Note: this document is a base template and does not constitute legal advice. Review by a lawyer is recommended, especially for clients outside Colombia.',
      docAria: 'Service agreement'
    },

    services: {
      marketing: { note: 'The monthly scope includes audience and channel strategy, a social content calendar, email flows and a monthly read-out of the numbers.' },
      campaigns: { note: 'The monthly scope includes platform and audience strategy, ad creative and copy, budget and bid management, conversion and funnel tracking, and a monthly report.' },
      chatbots: { note: 'The monthly scope includes conversational flows, lead qualification, booking and calendar integration, and monthly tuning based on real conversations.', priceNote: 'The chat marketing and automation tools required for the service shall be acquired separately by the Client, following the recommendations provided by the Provider; these costs are not included in the price of this Agreement.' },
      ai: { note: 'The monthly scope includes an opportunity audit, custom assistants trained on the business, automations and workflows the team can run itself.', priceNote: 'The AI tools and platforms (subscriptions, APIs, credits and licenses) required for the service shall be acquired separately by the Client, following the recommendations provided by the Provider; these costs are not included in the price of this Agreement.' },
      money: { note: 'The monthly scope includes budget and cash flow, forecasts you can update in minutes, real unit economics and a monthly review of the numbers.' },
      ecommerce: { note: 'The monthly scope includes a website and store review, conversion improvements, email and retention flows, analytics and a monthly experiment with a clear result.', priceNote: 'All services, platforms and tools required to build the website or e-commerce (domain, hosting, payment gateways, licenses, subscriptions and applications, among others) shall be paid for by the Client separately. These costs will be quoted and discussed in a meeting so the Client acquires them under the recommendations provided by the Provider; they are not included in the price of this Agreement.' }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
