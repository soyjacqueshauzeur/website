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
        price: 497,
        cardTitle: 'Marketing that<br/>works while you sleep.',
        cardDesc: 'Social, email and content strategy so your customers find you on their own — without you posting blindly.',
        tags: 'Social · email · content',
        pageTitle: 'Marketing that<br/><span class="lime">shows up</span>,<br/>month after month.',
        pageSub: "A monthly marketing hire for founders who don't have a marketing team — or the time to be one. I run the channels your customers actually use: the message, the calendar and the content. Your business keeps showing up without you chasing it.",
        pageMeta: 'Monthly hire · pause or cancel anytime',
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
        cardTitle: 'Campaigns with<br/>a number on them.',
        cardDesc: 'Paid media built around a target, not a feeling — audiences, budgets and tracking you can actually read at the end of the month.',
        tags: 'Paid media · tracking · funnels',
        pageTitle: 'Paid campaigns<br/>with <span class="lime">a number</span><br/>on the end.',
        pageSub: 'Ads you can actually read. Every campaign is built around a target and a budget, with tracking that tells you what came back at the end of the month. Setup, management and honest reporting — no vanity metrics.',
        pageMeta: 'Monthly hire · managed end to end',
        includes: [
          'Platform and audience strategy for your market',
          'Ad creative and copy that speaks to the target',
          'Budget and bid management, week by week',
          'Conversion tracking and funnel setup',
          'Ads on Meta, Google, TikTok and LinkedIn'
        ]
      },
      {
        id: 'chatbots',
        file: 'chatbots.html',
        num: '03',
        category: 'Chatbots',
        price: 597,
        cardTitle: 'Chatbots that<br/>close the loop.',
        cardDesc: 'Conversational flows that answer, qualify and book while you sleep — running on the channels your customers already use.',
        tags: 'Live chat · messengers · booking',
        pageTitle: 'Chatbots that<br/><span class="lime">answer, qualify</span><br/>and book.',
        pageSub: 'A conversational assistant on the channels your customers already use — answering the repeat questions, qualifying leads and booking calls while you sleep. You review the conversations; the bot does the heavy lifting.',
        pageMeta: 'Monthly hire · built and maintained',
        includes: [
          'Conversation flows for your most common questions',
          'Lead qualification before it reaches you',
          'Booking and calendar integration',
          'Handoff to a human when a reply really needs you',
          'Monthly tuning based on real conversations'
        ]
      },
      {
        id: 'ai',
        file: 'ai.html',
        num: '04',
        category: 'AI',
        price: 497,
        cardTitle: 'An assistant that<br/>does the work, not promises.',
        cardDesc: 'Answers your email, schedules meetings and fills in your reports — hours you get back this very week.',
        tags: 'Assistants · automations · workflows',
        pageTitle: 'AI that does<br/><span class="lime">real work</span><br/>this week.',
        pageSub: 'Practical AI, not a demo. Assistants, automations and workflows set up on your real stack — the kind that save hours this very week and that you can actually run and change yourself.',
        pageMeta: 'Monthly hire · built on your stack',
        includes: [
          'Audit of where AI saves you real hours',
          'Custom assistants trained on your business',
          'Automations across your tools and inbox',
          'Workflows your team can run without me',
          'Monthly upgrade pass as the tools improve'
        ]
      },
      {
        id: 'money',
        file: 'financial-planning.html',
        num: '05',
        category: 'Financial planning',
        price: 197,
        cardTitle: 'The numbers game.',
        cardDesc: 'Founders rarely go broke from a bad product — they go broke from blind numbers. Budgets, cash flow and forecasts that keep the money side honest.',
        tags: 'Cash flow · budgets · forecasts',
        pageTitle: 'Your money,<br/><span class="lime">run on</span><br/>technology.',
        pageSub: 'Numbers you can finally see. Budgets, cash flow and forecasts set up in tools that keep the money side of your business honest — so you decide from clarity, not from a gut feeling.',
        pageMeta: 'Monthly hire · numbers you can read',
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
        price: 397,
        cardTitle: 'Your website and store,<br/>ready to sell.',
        cardDesc: 'Websites and e-commerce built to convert — design, product pages and analytics that show what moves the number.',
        tags: 'Websites · stores · analytics',
        pageTitle: 'Your website and store,<br/><span class="lime">ready to</span><br/>sell.',
        pageSub: 'Your website and store, built to sell, not just to exist. Design, product pages, checkout and analytics that tell you why people buy — and the changes that move the number each month.',
        pageMeta: 'Monthly hire · website + store',
        includes: [
          'Website and store review — design, product pages and checkout',
          'Conversion fixes shipped each month',
          'Email and retention flows for repeat sales',
          'Analytics that explain the why, not just visits',
          'A monthly experiment with a clear result'
        ]
      }
    ],

    labels: {
      hire: 'Hire',
      add: 'Hire',
      priceMonth: '/month',
      everyMonth: 'every month, no lock-in',
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
      billingNote: 'Prices in USD, before any tax. When you send the order I reply with the payment link for the exact amount.',
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
      otherLede: 'Hire more than one service and run them as one monthly system.',
      hireAnother: 'Bundle it',
      openCart: 'Review & send order'
    },

    payments: [
      { id: 'mercadopago', label: 'Mercado Pago', note: 'Cards, PSE and local payments' },
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
