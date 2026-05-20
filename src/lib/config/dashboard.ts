import { IntervalE } from '../types/enums';

const configuration = {
  routes: [
    { title: 'Overview', link: '/dashboard/main', icon: 'Home' },
    { title: 'Connections', link: '/dashboard/connections', icon: 'Link' },
    { title: 'Keywords', link: '/dashboard/keywords', icon: 'Key' },
    { title: 'Content Queue', link: '/dashboard/content', icon: 'FileText' },
    { title: 'Brand Voice', link: '/dashboard/brand-voice', icon: 'Sparkles' },
    { title: 'Settings', link: '/dashboard/settings/profile', icon: 'Settings' }
  ],
  subroutes: {
    settings: [
      { title: 'Profile', link: '/dashboard/settings/profile' },
      { title: 'Billing', link: '/dashboard/settings/billing' },
      { title: 'Webhooks', link: '/dashboard/settings/webhooks' }
    ]
  },
  products: [
    {
      name: 'Free',
      description: 'AI SEO imkoniyatlarini bepul sinab ko\'rish uchun',
      features: [
        '1 ta WordPress sayt bog\'lash',
        '10 ta kalit so\'z tahlili / oy',
        '2 ta AI maqola / oy',
        'Telegram kanalda avto-anons',
        'Standard yordam'
      ],
      plans: [
        {
          name: 'Free Plan',
          interval: IntervalE.MONTHLY,
          price: '0',
          price_id: 'plan_free',
          isPopular: false
        }
      ]
    },
    {
      name: 'Starter',
      description: 'Kichik bloglar va yangi boshlovchilar uchun mos',
      features: [
        '3 ta WordPress sayt bog\'lash',
        '100 ta kalit so\'z tahlili / oy',
        '20 ta AI maqola / oy',
        'Telegram kanalda avto-anons',
        'DALL-E 3 muqova rasmlari',
        'Email orqali qo\'llab-quvvatlash'
      ],
      plans: [
        {
          name: 'Starter Monthly',
          interval: IntervalE.MONTHLY,
          price: '19',
          price_id: 'plan_starter_monthly',
          isPopular: false
        },
        {
          name: 'Starter Annual',
          interval: IntervalE.YEARLY,
          price: '190',
          price_id: 'plan_starter_yearly',
          isPopular: false
        }
      ]
    },
    {
      name: 'Pro',
      description: 'Professionallar va o\'suvchi bizneslar uchun mukammal yechim',
      features: [
        '10 ta WordPress sayt bog\'lash',
        '500 ta kalit so\'z tahlili / oy',
        '80 ta AI maqola / oy',
        'Telegram kanalda avto-anons',
        'DALL-E 3 muqova rasmlari',
        '24/7 VIP tezkor qo\'llab-quvvatlash'
      ],
      plans: [
        {
          name: 'Pro Monthly',
          interval: IntervalE.MONTHLY,
          price: '49',
          price_id: 'plan_pro_monthly',
          isPopular: true
        },
        {
          name: 'Pro Annual',
          interval: IntervalE.YEARLY,
          price: '490',
          price_id: 'plan_pro_yearly',
          isPopular: false
        }
      ]
    },
    {
      name: 'Agency',
      description: 'Agentliklar va yirik brendlar uchun to\'liq avtomatlashtirish',
      features: [
        'Cheksiz WordPress sayt bog\'lash',
        'Cheksiz kalit so\'z tahlili',
        '200 ta AI maqola / oy',
        'Telegram kanalda avto-anons',
        'DALL-E 3 muqova rasmlari',
        'Shaxsiy menejer yordami'
      ],
      plans: [
        {
          name: 'Agency Monthly',
          interval: IntervalE.MONTHLY,
          price: '99',
          price_id: 'plan_agency_monthly',
          isPopular: false
        },
        {
          name: 'Agency Annual',
          interval: IntervalE.YEARLY,
          price: '990',
          price_id: 'plan_agency_yearly',
          isPopular: false
        }
      ]
    }
  ]
};

export default configuration;
