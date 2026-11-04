/*
 * service-faq.mjs — FAQ de las páginas de servicio, en un solo sitio.
 *
 * La misma lista alimenta:
 *   - el FAQPage del JSON-LD (tools/apply-seo.mjs)
 *   - el bloque visible de la página (tools/build-hire-pages.mjs)
 *
 * Si los dos no salen de aquí, el marcado estructurado describe contenido que
 * no está en la página — que es exactamente lo que penaliza Google.
 */
const T = {
  en: {
    month: 'month',
    faqMin: 'No lock-in. Choose 1, 3, 6 or 12 months and pause or cancel anytime.',
    faqBundle: 'Yes — hire several services and run them as one monthly system.',
    faqInclude: (cat) => `What does ${cat} include each month?`,
    faqCost: (cat) => `How much does ${cat} cost?`,
    faqMinQ: 'Is there a minimum contract?',
    faqBundleQ: 'Can I combine it with other services?',
  },
  es: {
    month: 'mes',
    faqMin: 'Sin permanencia. Elige 1, 3, 6 o 12 meses y pausa o cancela cuando quieras.',
    faqBundle: 'Sí — contrata varios servicios y llévalos como un solo sistema mensual.',
    faqInclude: (cat) => `¿Qué incluye ${cat} cada mes?`,
    faqCost: (cat) => `¿Cuánto cuesta ${cat}?`,
    faqMinQ: '¿Hay contrato mínimo?',
    faqBundleQ: '¿Puedo combinarlo con otros servicios?',
  },
};

/**
 * @param {'en'|'es'} lang
 * @param {object} svc   servicio de hire-data (category, price, includes, noteFaq…)
 * @param {string} billingNote  etiqueta de facturación del idioma
 * @returns {{q:string,a:string}[]}
 */
export function serviceFaqs(lang, svc, billingNote) {
  const t = T[lang] || T.en;
  return [
    { q: t.faqInclude(svc.category), a: svc.includes.join('; ') },
    { q: t.faqCost(svc.category), a: `USD $${svc.price}/${t.month}. ${billingNote}` },
    ...(svc.noteFaq ? [{ q: svc.noteFaq, a: svc.noteFaqA }] : []),
    { q: t.faqMinQ, a: t.faqMin },
    { q: t.faqBundleQ, a: t.faqBundle },
  ];
}
