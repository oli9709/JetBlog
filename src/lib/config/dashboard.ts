import { IntervalE } from '../types/enums';

export interface PlanLocaleContent {
  description: string;
  features: string[];
}

export const PLAN_TRANSLATIONS: Record<string, Record<string, PlanLocaleContent>> = {
  'Free Trial': {
    uz: {
      description: "JetBlog ni bepul sinab ko'ring",
      features: [
        '2 ta AI maqola (bir martalik)',
        '1 ta WordPress sayt bog\'lash',
        '1 ta Telegram kanal',
        '10 ta kalit so\'z tahlili',
        'DALL-E 3 rasm (2 ta)',
      ],
    },
    ru: {
      description: 'Попробуйте JetBlog бесплатно',
      features: [
        '2 AI-статьи (одноразово)',
        '1 сайт WordPress',
        '1 Telegram-канал',
        '10 анализов ключевых слов',
        'DALL-E 3 изображения (2 шт.)',
      ],
    },
    en: {
      description: 'Try JetBlog for free',
      features: [
        '2 AI articles (one-time)',
        '1 WordPress site',
        '1 Telegram channel',
        '10 keyword analyses',
        'DALL-E 3 images (2)',
      ],
    },
  },
  'Starter': {
    uz: {
      description: 'Kichik bloglar va yangi boshlovchilar uchun',
      features: [
        '30 ta AI maqola / oy',
        '1 ta WordPress sayt',
        '1 ta Telegram kanal',
        '100 ta kalit so\'z tahlili / oy',
        'DALL-E 3 muqova rasmlari',
        'UZ / RU / EN tillar',
        'Email yordam',
      ],
    },
    ru: {
      description: 'Для небольших блогов и начинающих',
      features: [
        '30 AI-статей / месяц',
        '1 сайт WordPress',
        '1 Telegram-канал',
        '100 анализов ключевых слов / мес.',
        'Обложки DALL-E 3',
        'UZ / RU / EN языки',
        'Поддержка по email',
      ],
    },
    en: {
      description: 'For small blogs and beginners',
      features: [
        '30 AI articles / month',
        '1 WordPress site',
        '1 Telegram channel',
        '100 keyword analyses / month',
        'DALL-E 3 cover images',
        'UZ / RU / EN languages',
        'Email support',
      ],
    },
  },
  'Pro': {
    uz: {
      description: "O'suvchi bizneslar uchun mukammal yechim",
      features: [
        '80 ta AI maqola / oy',
        '3 ta WordPress sayt',
        '3 ta Telegram kanal',
        '500 ta kalit so\'z tahlili / oy',
        'DALL-E 3 muqova rasmlari',
        'Webhook integratsiya',
        'Google Search Console',
        '24/7 tezkor yordam',
      ],
    },
    ru: {
      description: 'Идеальное решение для растущего бизнеса',
      features: [
        '80 AI-статей / месяц',
        '3 сайта WordPress',
        '3 Telegram-канала',
        '500 анализов ключевых слов / мес.',
        'Обложки DALL-E 3',
        'Webhook интеграция',
        'Google Search Console',
        'Поддержка 24/7',
      ],
    },
    en: {
      description: 'Perfect solution for growing businesses',
      features: [
        '80 AI articles / month',
        '3 WordPress sites',
        '3 Telegram channels',
        '500 keyword analyses / month',
        'DALL-E 3 cover images',
        'Webhook integration',
        'Google Search Console',
        '24/7 priority support',
      ],
    },
  },
  'Agency': {
    uz: {
      description: 'Agentliklar va yirik brendlar uchun',
      features: [
        '250 ta AI maqola / oy',
        '10 ta WordPress sayt',
        'Cheksiz Telegram kanallar',
        'Cheksiz kalit so\'z tahlili',
        'DALL-E 3 muqova rasmlari',
        'Webhook + GSC + Admin panel',
        'Shaxsiy menejer',
        'Invoice (hisob-faktura) tizimi',
      ],
    },
    ru: {
      description: 'Для агентств и крупных брендов',
      features: [
        '250 AI-статей / месяц',
        '10 сайтов WordPress',
        'Безлимитные Telegram-каналы',
        'Безлимитный анализ ключевых слов',
        'Обложки DALL-E 3',
        'Webhook + GSC + Admin panel',
        'Персональный менеджер',
        'Система счетов-фактур',
      ],
    },
    en: {
      description: 'For agencies and large brands',
      features: [
        '250 AI articles / month',
        '10 WordPress sites',
        'Unlimited Telegram channels',
        'Unlimited keyword analyses',
        'DALL-E 3 cover images',
        'Webhook + GSC + Admin panel',
        'Dedicated account manager',
        'Invoice billing system',
      ],
    },
  },
};

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
