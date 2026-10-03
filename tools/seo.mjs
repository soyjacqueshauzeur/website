#!/usr/bin/env node
/*
 * SEO single source of truth — canonical domain, brand entity and JSON-LD
 * builders shared by apply-seo.mjs, build-sitemap.mjs and seo-check.mjs.
 * Language/URL dimensions come from tools/locales.mjs.
 */

import { locale, langForPath, PAGE_ALIASES, DEFAULT_LANG } from './locales.mjs';

export const SITE = {
  origin: 'https://soyjacqueshauzeur.dev',
  name: 'Jacques Hauzeur',
  alternateName: 'SoyJacquesHauzeur',
  logo: '/assets/logo.png',
  logo1920: '/assets/logo-1920.png',
  ogImage: '/assets/og-default.png',
  personImage: '/assets/img/me.jpeg',
  telephone: '+573507402009',
  areaServed: 'Worldwide',
  sameAs: [
    'https://www.facebook.com/soyjacqueshauzeur',
    'https://www.instagram.com/soyjacqueshauzeur/',
    'https://www.linkedin.com/in/soyjacqueshauzeur/',
    'https://www.tiktok.com/@soyjacqueshauzeur',
    'https://www.youtube.com/@soyjacqueshauzeur'
  ]
};

export const HIRE_WORD = { en: 'monthly hire', es: 'hire mensual' };

const ID = {
  org: SITE.origin + '/#organization',
  logo: SITE.origin + '/#logo',
  person: SITE.origin + '/#person',
  website: SITE.origin + '/#website'
};

export function abs(p) { return SITE.origin + p; }

export function plain(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\u00d7/g, 'x')
    .replace(/\s+/g, ' ').trim();
}

/* Path within its locale ('clients.html', 'blog/2026/07/x.html'). */
export function logicalOf(path) {
  const clean = String(path).replace(/^\.\//, '').replace(/^\/+/, '');
  return clean.slice(locale(langForPath(clean)).dir.length);
}

/* Absolute URL for `logical` expressed in `lang`'s own naming. */
export function urlFor(lang, logical) {
  const base = locale(lang).base;                 // '/' | '/es/'
  const parts = logical.split('/');
  const file = parts.pop();
  const dir = parts.length ? parts.join('/') + '/' : '';
  return SITE.origin + base + dir + (file === 'index.html' ? '' : file);
}

/* Canonical URL for a repo-relative page path. */
export function canonicalUrl(path) {
  return urlFor(langForPath(path), logicalOf(path));
}

/* EN/ES/x-default alternates for a repo-relative page path. */
export function alternates(path) {
  const lang = langForPath(path);
  const logical = logicalOf(path);
  const swap = (to) => {
    const parts = logical.split('/');
    let f = parts.pop();
    if (to !== lang) f = PAGE_ALIASES[f] || f;
    return urlFor(to, [...parts, f].join('/'));
  };
  return { en: swap('en'), es: swap('es'), x: swap(DEFAULT_LANG) };
}

/* ---------------- JSON-LD nodes ---------------- */

export function organization() {
  return {
    '@type': 'Organization', '@id': ID.org,
    name: SITE.name, alternateName: SITE.alternateName, url: abs('/'),
    logo: { '@type': 'ImageObject', '@id': ID.logo, url: abs(SITE.logo), width: 512, height: 512, caption: SITE.name },
    image: { '@id': ID.logo },
    sameAs: SITE.sameAs,
    contactPoint: {
      '@type': 'ContactPoint', telephone: SITE.telephone, contactType: 'customer service',
      areaServed: SITE.areaServed, availableLanguage: ['English', 'Spanish']
    },
    knowsLanguage: ['en', 'es'],
    founder: { '@id': ID.person }
  };
}

export function person() {
  return {
    '@type': 'Person', '@id': ID.person,
    name: SITE.name, jobTitle: 'Technology educator', url: abs('/'),
    description: 'Technology educator helping businesses and professionals adopt AI, chatbots, marketing and web.',
    image: abs(SITE.personImage), sameAs: SITE.sameAs,
    mainEntityOfPage: { '@id': ID.person },
    knowsAbout: ['Marketing', 'Paid campaigns', 'Chatbots', 'Artificial intelligence', 'Financial planning', 'Web & e-commerce']
  };
}

export function website(lang) {
  return {
    '@type': 'WebSite', '@id': ID.website, url: abs('/'),
    name: SITE.name, inLanguage: lang, publisher: { '@id': ID.org }
  };
}

function offer(lang, svc, url) {
  return {
    '@type': 'Offer',
    price: svc.price, priceCurrency: 'USD',
    availability: 'https://schema.org/InStock', url,
    priceSpecification: {
      '@type': 'UnitPriceSpecification', price: svc.price, priceCurrency: 'USD',
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' }
    },
    eligibleDuration: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 12, unitCode: 'MON' }
  };
}

export function service(lang, svc, url) {
  return {
    '@type': 'Service',
    '@id': url + '#service',
    name: `${svc.category} — ${HIRE_WORD[lang]}`,
    serviceType: svc.category, category: svc.category,
    description: plain(svc.cardDesc || svc.pageSub),
    url, inLanguage: lang, image: abs(SITE.ogImage),
    provider: { '@id': ID.org },
    areaServed: { '@type': 'Place', name: SITE.areaServed },
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: url, availableLanguage: ['English', 'Spanish'] },
    termsOfService: urlFor(lang, 'contract.html'),
    offers: offer(lang, svc, url),
    mainEntityOfPage: { '@id': url + '#webpage' }
  };
}

export function offerCatalog(lang, services, url) {
  return {
    '@type': 'OfferCatalog', '@id': url + '#offercatalog', name: 'Monthly hire services',
    itemListElement: services.map((s) => ({
      '@type': 'Offer', price: s.price, priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: s.price, priceCurrency: 'USD', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
      itemOffered: { '@type': 'Service', name: s.category, url: urlFor(lang, s.file) }
    }))
  };
}

export function itemList(id, name, items) {
  return {
    '@type': 'ItemList', '@id': id, name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url }))
  };
}

export function breadcrumb(lang, page, items) {
  return {
    '@type': 'BreadcrumbList', '@id': canonicalUrl(page) + '#breadcrumb',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name,
      item: it.path ? urlFor(lang, it.path) : undefined
    }))
  };
}

export function webPage(lang, page, { title, description }) {
  const url = canonicalUrl(page);
  return {
    '@type': 'WebPage', '@id': url + '#webpage', url,
    name: title, description, inLanguage: lang,
    isPartOf: { '@id': ID.website }, about: { '@id': ID.org }
  };
}

export function profilePage(lang, page, { title, description }) {
  const url = canonicalUrl(page);
  return {
    '@type': 'ProfilePage', '@id': url + '#webpage', url,
    name: title, description, inLanguage: lang,
    isPartOf: { '@id': ID.website },
    about: { '@id': ID.person },
    mainEntity: { '@id': ID.person }
  };
}

export function faq(lang, page, faqs) {
  return {
    '@type': 'FAQPage', '@id': canonicalUrl(page) + '#faq',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}

export function blog(lang, page, posts) {
  const url = canonicalUrl(page);
  const node = {
    '@type': 'Blog', '@id': url + '#blog', url, name: lang === 'es' ? 'Blog de Jacques Hauzeur' : 'Jacques Hauzeur Blog',
    inLanguage: lang, publisher: { '@id': ID.org }
  };
  if (posts && posts.length) {
    node.blogPost = posts.map((p) => ({
      '@type': 'BlogPosting', headline: p.headline, url: p.url,
      ...(p.datePublished ? { datePublished: p.datePublished } : {})
    }));
  }
  return node;
}

export function blogPosting(lang, page, meta) {
  const url = canonicalUrl(page);
  const imgUrl = meta.image ? abs(meta.image) : abs(SITE.ogImage);
  return {
    '@type': 'BlogPosting',
    '@id': url + '#article',
    headline: meta.headline,
    description: meta.description,
    image: {
      '@type': 'ImageObject',
      url: imgUrl,
      creator: { '@id': ID.person },
      creditText: SITE.name,
      copyrightNotice: `© ${SITE.name}`,
      ...(meta.image ? { license: url, acquireLicensePage: url } : {})
    },
    datePublished: meta.datePublished,
    dateModified: meta.dateModified || meta.datePublished,
    inLanguage: lang,
    author: { '@type': 'Person', '@id': ID.person, name: meta.author || SITE.name, url: abs('/') },
    publisher: { '@id': ID.org },
    isPartOf: { '@id': ID.website },
    mainEntityOfPage: { '@id': url },
    ...(meta.category ? { articleSection: meta.category } : {}),
    ...(meta.tags && meta.tags.length ? { keywords: meta.tags.join(', ') } : {}),
    ...(meta.wordCount ? { wordCount: meta.wordCount } : {}),
    isAccessibleForFree: true,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.article-lead'] }
  };
}

export function course(lang, page, { title, description, price }) {
  const url = canonicalUrl(page);
  const node = {
    '@type': 'Course', '@id': url + '#course', url,
    name: title, description, inLanguage: lang,
    provider: { '@id': ID.org },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT90M',
      instructor: { '@id': ID.person },
      location: { '@type': 'VirtualLocation', url }
    }
  };
  if (price) {
    node.offers = {
      '@type': 'Offer', price, priceCurrency: 'USD',
      availability: 'https://schema.org/InStock', url
    };
  }
  return node;
}

export function collectionPage(lang, page, { title, description, items }) {
  const url = canonicalUrl(page);
  const node = {
    '@type': 'CollectionPage', '@id': url + '#webpage', url, name: title, description,
    inLanguage: lang, isPartOf: { '@id': ID.website }, about: { '@id': ID.org }
  };
  if (items && items.length) {
    node.mainEntity = itemList(url + '#list', title, items);
  }
  return node;
}

export function graph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function scriptLD(node) {
  return '  <script type="application/ld+json">' + JSON.stringify(node) + '</script>';
}
