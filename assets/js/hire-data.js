/* Hire catalogue (EN) — services, monthly prices and cart copy.
   Source of truth for the hire pages + the JS cart. Editable: prices, phone, links. */
(function (g) {
  g.JH_HIRE = {
    lang: 'en',
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
        price: 597,
        cardTitle: 'Online marketing<br/>(strategy for your goals).',
        cardDesc: 'Social, email and content strategy so your customers find you on their own — without you posting blindly.',
        tags: 'Social · email · content',
        pageTitle: 'Marketing that<br/><span class="lime">shows up</span>,<br/>month after month.',
        pageSub: "A monthly marketing hire for founders who don't have a marketing team — or the time to be one. I run the channels your customers actually use: the message, the calendar and the content. Your business keeps showing up without you chasing it.",
        pageMeta: 'Prepaid · one payment for the months you pick',
        includes: [
          'Audience and channel strategy on your real customers',
          'Social content calendar — written, designed and posted',
          'Email and newsletter flows that earn attention',
          'Monthly read-out of the numbers, in plain language',
          'A direct line to me between check-ins'
        ]
      },
      {
        id: 'campaigns',
        file: 'campaigns.html',
        num: '02',
        category: 'Campaigns',
        price: 397,
        cardTitle: 'Campaigns<br/>(with clear objectives).',
        cardDesc: 'Paid media built around a target, not a feeling — audiences, budgets and tracking you can actually read at the end of the month.',
        tags: 'Paid media · tracking · funnels',
        pageTitle: 'Paid campaigns<br/>with <span class="lime">a number</span><br/>on the end.',
        pageSub: 'Ads you can actually read. Every campaign is built around a target and a budget, with tracking that tells you what came back at the end of the month. Setup, management and honest reporting — no vanity metrics.',
        pageMeta: 'Prepaid · one payment · managed end to end',
        includes: [
          'Platform and audience strategy for your market',
          'Ad creative and copy that speaks to the target',
          'Budget and bid management, week by week',
          'Conversion tracking and funnel setup',
          'Ads on Meta, Google, TikTok and LinkedIn'
        ],
        note: '<strong>Ad spend is separate.</strong> This price covers my strategy, creative and campaign management. You pay the ads budget directly to each platform — Meta, Google, TikTok or LinkedIn — and we set it together before we start: I look at your case, your margins and your goals, then suggest how much to invest and how to split it. That budget is yours: adjust it whenever you want.',
        noteFaq: 'Is ad spend included in the price?',
        noteFaqA: 'No. The service price covers my strategy, creative and campaign management; ad spend is separate and you pay it directly to each platform (Meta, Google, TikTok, LinkedIn). Before we start I look at your case and your goals and suggest how much to invest and how to split it; you can adjust that budget whenever you want.'
      },
      {
        id: 'chatbots',
        file: 'chatbots.html',
        num: '03',
        category: 'Chatbots',
        price: 597,
        cardTitle: 'Chatbots<br/>(to close sales<br/>or answer questions).',
        cardDesc: 'Conversational flows that answer, qualify and book while you sleep — running on the channels your customers already use.',
        tags: 'Live chat · messengers · booking',
        pageTitle: 'Chatbots that<br/><span class="lime">answer, qualify</span><br/>and book.',
        pageSub: 'A conversational assistant on the channels your customers already use — answering the repeat questions, qualifying leads and booking calls while you sleep. You review the conversations; the bot does the heavy lifting.',
        pageMeta: 'Prepaid · one payment · built and maintained',
        includes: [
          'Conversation flows for your most common questions',
          'Lead qualification before it reaches you',
          'Booking and calendar integration',
          'Handoff to a human when a reply really needs you',
          'Monthly tuning based on real conversations'
        ],
        note: '<strong>The platforms are separate.</strong> This price covers the design, build and maintenance of the conversation flows. The accounts and fees for each channel — WhatsApp Business (Meta), Instagram, Messenger, Telegram or the web — are contracted and paid by you directly with the provider. And if the bot uses artificial intelligence, token usage is separate too: it is billed by the model you use and the volume of conversations you have. We estimate it together before we start, with a realistic number for your traffic, and you adjust it whenever you want.',
        noteFaq: 'Are the platforms and the AI usage included in the price?',
        noteFaqA: 'No. The price covers the design, build and maintenance of the flows. The accounts and fees for each channel (WhatsApp Business, Instagram, Messenger, Telegram or the web) are paid by you directly with the provider, and if the bot uses artificial intelligence, token usage is billed separately by model and conversation volume.'
      },
      {
        id: 'ai',
        file: 'ai.html',
        num: '04',
        category: 'AI',
        price: 796,
        cardTitle: 'Artificial intelligence<br/>(in the business).',
        cardDesc: 'Answers your email, schedules meetings and fills in your reports — hours you get back this very week.',
        tags: 'Assistants · automations · workflows',
        pageTitle: 'AI that does<br/><span class="lime">real work</span><br/>this week.',
        pageSub: 'Practical AI, not a demo. Assistants, automations and workflows set up on your real stack — the kind that save hours this very week and that you can actually run and change yourself.',
        pageMeta: 'Prepaid · one payment · built on your stack',
        includes: [
          'Audit of where AI saves you real hours',
          'Custom assistants trained on your business',
          'Automations across your tools and inbox',
          'Workflows your team can run without me',
          'Monthly upgrade pass as the tools improve'
        ],
        note: '<strong>The costs of AI are separate.</strong> This price covers the strategy, the build and the maintenance of the assistants and automations. What the models and tools consume is paid separately: platform fees, tokens for each model, the APIs you use (OpenAI, Anthropic, Google or any other), MCP servers and any other element that generates a cost. It is not a fixed expense: it depends on the model and its price per million tokens, on the APIs you connect and on the real volume of work. We estimate it together before we start, on your actual case, and you adjust it whenever you want: a smaller model, a monthly cap or more volume when the results justify it.',
        noteFaq: 'Are platform, token, API and MCP costs included in the price?',
        noteFaqA: 'No. The price covers the strategy, the build and the maintenance of the assistants and automations. Platform fees, tokens for each model, APIs, MCP servers and any other service that generates a cost are paid separately, directly to each provider, and vary with the model and the real volume of work; we estimate them together before we start.'
      },
      {
        id: 'money',
        file: 'financial-planning.html',
        num: '05',
        category: 'Financial planning',
        price: 197,
        cardTitle: 'Data analysis<br/>& metrics.',
        cardDesc: 'Founders rarely go broke from a bad product — they go broke from blind numbers. Budgets, cash flow and forecasts that keep the money side honest.',
        tags: 'Cash flow · budgets · forecasts',
        pageTitle: 'Your money,<br/><span class="lime">run on</span><br/>technology.',
        pageSub: 'Numbers you can finally see. Budgets, cash flow and forecasts set up in tools that keep the money side of your business honest — so you decide from clarity, not from a gut feeling.',
        pageMeta: 'Prepaid · one payment · numbers you can read',
        includes: [
          'Budget and cash-flow setup that matches how you work',
          'Forecasts you can update in minutes, not days',
          'Your real unit economics, laid out plainly',
          'A monthly review of what the numbers changed',
          'Tools chosen so you keep running them'
        ]
      },
      {
        id: 'ecommerce',
        file: 'ecommerce.html',
        num: '06',
        category: 'Web & e-commerce',
        price: 297,
        cardTitle: 'Websites<br/>& online stores.',
        cardDesc: 'Websites and e-commerce built to convert — design, product pages and analytics that show what moves the number.',
        tags: 'Websites · stores · analytics',
        pageTitle: 'Your website and store,<br/><span class="lime">ready to</span><br/>sell.',
        pageSub: 'Your website and store, built to sell, not just to exist. Design, product pages, checkout and analytics that tell you why people buy — and the changes that move the number each month.',
        pageMeta: 'Prepaid · one payment · website + store',
        includes: [
          'Website and store review — design, product pages and checkout',
          'Conversion fixes shipped each month',
          'Email and retention flows for repeat sales',
          'Analytics that explain the why, not just visits',
          'A monthly experiment with a clear result'
        ],
        note: '<strong>The online store is separate from the informative website.</strong> This rate covers an informative website — design, content and improvements month after month. If you also need to sell, the store (e-commerce) costs 50% more on top of that base: catalogue, product pages, checkout and payments. And the tools that keep the project running — hosting, domain, SSL certificate and other services — are contracted and paid by you directly with each provider; I help you choose the right ones and size them for your traffic, but they are not part of the price.',
        noteFaq: 'Are the online store and the tools included in the price?',
        noteFaqA: 'The base rate covers an informative website; the online store (e-commerce) costs 50% more on top of that base. The tools that keep the project running — hosting, domain, SSL certificate and other services — are contracted and paid by you directly with each provider, so they are not included in the price.'
      }
    ],

    labels: {
      hire: 'View this service',
      add: 'Hire',
      priceMonth: '/month',
      everyMonth: 'one payment for the months you choose',
      viewService: 'View service',
      duration: 'Duration',
      durationPick: 'How many months?',
      remove: 'Remove',
      cartTitle: "Summary of what you're hiring",
      cartOpen: 'Open your hire',
      bubbleLabel: 'services selected',
      empty: 'Nothing selected yet — pick a service above and it will appear here.',
      subTotal: 'Subtotal',
      total: 'Total due',
      approxTotal: 'Approx. in your currency',
      perItem: '/mo',
      billingNote: 'Prices in USD, before any tax. You pay the full total once, for the months you choose; when you send the order I reply with the payment link for the exact amount.',
      sendTitle: 'Send the order',
      paymentTitle: 'How do you want to pay?',
      paymentNote: 'Choose the method and send the order — I confirm and send you the payment link right away.',
      wa: 'Send order via WhatsApp',
      tg: 'Send order via Telegram',
      waNote: 'Opens WhatsApp with the order ready',
      monthWord: 'mo',
      cancel: 'Close',
      continue: 'Keep browsing',
      added: 'Added to your hire',
      monthsChips: ['1 mo', '3 mo', '6 mo', '12 mo'],
      min: 'min.',
      youGet: 'What you get each month',
      otherServices: 'Also hireable',
      otherLede: 'Hire more than one service and run them as one system — one single payment.',
      hireAnother: 'Bundle it',
      openCart: 'Review & send order'
    },

    payments: [
      { id: 'mercadopago', label: 'Mercado Pago', note: 'Credit card · one-time payment' },
      { id: 'paypal', label: 'PayPal', note: 'PayPal balance or card' },
      { id: 'bank', label: 'Local bank transfer', note: 'Direct deposit in your country' },
      { id: 'other', label: 'Other / let\u2019s agree', note: 'Whatever works for you' }
    ],

    message: {
      hi: 'Hi Jacques! I would like to hire:',
      line: function (name, months, per, sub) {
        return '- ' + name + ' — ' + months + ' mo \u00d7 ' + per + '/mo = ' + sub;
      },
      total: 'Total: ',
      payWith: 'Payment: ',
      sendLink: 'Please send me the payment link. Thanks!',
      name: 'Name: ',
      site: 'Website: '
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
