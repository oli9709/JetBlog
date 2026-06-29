import { IntervalE } from '../types/enums';

const configuration = {
  routes: [
    { title: 'Bosh sahifa', link: '/dashboard/main', icon: 'Home' },
    { title: 'Ulanishlar', link: '/dashboard/connections', icon: 'Link' },
    { title: 'Kalit so\'zlar', link: '/dashboard/keywords', icon: 'Key' },
    { title: 'Kontent navbati', link: '/dashboard/content', icon: 'FileText' },
    { title: 'Brend ovozi', link: '/dashboard/brand-voice', icon: 'Sparkles' },
    { title: 'Sozlamalar', link: '/dashboard/settings/profile', icon: 'Settings' }
  ],
  subroutes: {
    settings: [
      { title: 'Profil', link: '/dashboard/settings/profile' },
      { title: 'To\'lov', link: '/dashboard/settings/billing' },
      { title: 'Webhook\'lar', link: '/dashboard/settings/webhooks' }
    ]
  },
  products: [
    {
      name: 'Free Trial',
      description: 'JetBlog ni bepul sinab ko\'ring',
      features: [
        '2 ta AI maqola (bir martalik)',
        '1 ta WordPress sayt bog\'lash',
        '1 ta Telegram kanal',
        '10 ta kalit so\'z tahlili',
        'DALL-E 3 rasm (2 ta)'
      ],
      plans: [
        {
          name: 'Free Trial',
          interval: IntervalE.MONTHLY,
          price: '0',
          price_id: 'plan_free',
          isPopular: false
        }
      ]
    },
    {
      name: 'Starter',
      description: 'Kichik bloglar va yangi boshlovchilar uchun',
      features: [
        '30 ta AI maqola / oy',
        '1 ta WordPress sayt',
        '1 ta Telegram kanal',
        '100 ta kalit so\'z tahlili / oy',
        'DALL-E 3 muqova rasmlari',
        'UZ / RU / EN tillar',
        'Email yordam'
      ],
      plans: [
        {
          name: 'Starter Monthly',
          interval: IntervalE.MONTHLY,
          price: '9',
          price_id: 'plan_starter_monthly',
          isPopular: false
        },
        {
          name: 'Starter Annual',
          interval: IntervalE.YEARLY,
          price: '7',
          price_id: 'plan_starter_yearly',
          isPopular: false
        }
      ]
    },
    {
      name: 'Pro',
      description: 'O\'suvchi bizneslar uchun mukammal yechim',
      features: [
        '80 ta AI maqola / oy',
        '3 ta WordPress sayt',
        '3 ta Telegram kanal',
        '500 ta kalit so\'z tahlili / oy',
        'DALL-E 3 muqova rasmlari',
        'Webhook integratsiya',
        'Google Search Console',
        '24/7 tezkor yordam'
      ],
      plans: [
        {
          name: 'Pro Monthly',
          interval: IntervalE.MONTHLY,
          price: '29',
          price_id: 'plan_pro_monthly',
          isPopular: true
        },
        {
          name: 'Pro Annual',
          interval: IntervalE.YEARLY,
          price: '23',
          price_id: 'plan_pro_yearly',
          isPopular: false
        }
      ]
    },
    {
      name: 'Agency',
      description: 'Agentliklar va yirik brendlar uchun',
      features: [
        '250 ta AI maqola / oy',
        '10 ta WordPress sayt',
        'Cheksiz Telegram kanallar',
        'Cheksiz kalit so\'z tahlili',
        'DALL-E 3 muqova rasmlari',
        'Webhook + GSC + Admin panel',
        'Shaxsiy menejer',
        'Invoice (hisob-faktura) tizimi'
      ],
      plans: [
        {
          name: 'Agency Monthly',
          interval: IntervalE.MONTHLY,
          price: '79',
          price_id: 'plan_agency_monthly',
          isPopular: false
        },
        {
          name: 'Agency Annual',
          interval: IntervalE.YEARLY,
          price: '63',
          price_id: 'plan_agency_yearly',
          isPopular: false
        }
      ]
    }
  ]
};

export default configuration;
