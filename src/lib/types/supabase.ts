import { Session, User } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';

export type ProfileT = {
  id: string;
  display_name?: string | null;
  credits_remaining?: number;
  plan?: 'FREE' | 'STARTER' | 'PRO' | 'AGENCY';
  stripe_customer_id?: string | null;
  subscription_id?: string | null;
  onboarding_completed?: boolean;
};

export type SubscriptionT = {
  created_at: string | Date | null;
  id: string;
  period_ends_at: string | null;
  period_starts_at: string | null;
  price_id: string;
  status: string;
};

export type PlatformType = 'wordpress' | 'ghost' | 'webhook' | 'webflow';

export type WordPressAdapterConfig = Record<string, never>;
export type GhostAdapterConfig = { apiUrl: string; adminApiKey: string };
export type WebhookAdapterConfig = { endpointUrl: string; secretKey: string };

/**
 * Webflow CMS adapter config
 *
 * adapter_config shape (stored encrypted where noted):
 * {
 *   apiToken:       string   — Webflow Site API Token (AES-256-GCM encrypted)
 *   siteId:         string   — Webflow site ID (from /v2/sites)
 *   collectionId:   string   — CMS Collection ID
 *   collectionSlug: string   — collection URL slug (e.g. 'blog-posts'), for URL construction
 *   siteDomain:     string   — primary domain (e.g. 'example.webflow.io'), for URL construction
 *   fieldMap: {
 *     body:     string   — slug of the RichText field that holds article HTML (REQUIRED)
 *     title?:   string   — slug of a custom PlainText/RichText field for the article title (optional;
 *                          `name` system field is always set from article.title regardless)
 *     summary?: string   — slug of a PlainText field for the SEO meta description
 *     image?:   string   — slug of an Image field for the featured image
 *   }
 * }
 */
export type WebflowFieldMap = {
  body: string;
  title?: string;
  summary?: string;
  image?: string;
};

export type WebflowAdapterConfig = {
  apiToken: string;        // encrypted AES-256-GCM
  siteId: string;
  collectionId: string;
  collectionSlug: string;
  siteDomain: string;
  fieldMap: WebflowFieldMap;
};

export type AdapterConfig =
  | WordPressAdapterConfig
  | GhostAdapterConfig
  | WebhookAdapterConfig
  | WebflowAdapterConfig;

export type SiteT = {
  id: string;
  user_id: string;
  url: string;
  wp_username: string;
  wp_password?: string;       // Shifrlangan (AES-256-GCM) — faqat WordPress uchun
  platform_type: PlatformType;
  adapter_config: AdapterConfig;
  brand_voice: {
    voice_description?: string;
    tone?: string;
    target_audience?: string;
    rules?: string[];
  };
  publish_days: string[];
  publish_time: string;
  is_active: boolean;
  telegram_chat_id?: string | null;
  indexnow_key?: string | null;
  default_language?: 'uz' | 'en' | 'ru';
  created_at: string;
};

export type KeywordT = {
  id: string;
  site_id: string;
  keyword: string;
  language: 'uz' | 'ru' | 'en';
  search_volume: number;
  difficulty: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by_user: boolean;
  article_id?: string | null;
  created_at: string;
};

export type ArticleT = {
  id: string;
  site_id: string;
  keyword_id: string;
  title: string;
  content: string;
  seo_title?: string | null;
  seo_description?: string | null;
  tags?: string[];
  featured_image_url?: string | null;
  wp_post_id?: number | null;
  status: 'draft' | 'scheduled' | 'published' | 'error' | 'queued' | 'generating' | 'imaging' | 'publishing' | 'failed';
  scheduled_for?: string | null;
  published_at?: string | null;
  ai_tokens_used: number;
  error_message?: string | null;
  generation_error?: string | null;
  generation_started_at?: string | null;
  generation_completed_at?: string | null;
  published_url?: string | null;
  created_at: string;
};

export type InvoiceT = {
  id: string;
  user_id: string;
  amount_usd: number;
  credits_to_add: number;
  status: 'pending' | 'paid' | 'cancelled';
  invoice_pdf_url?: string | null;
  paid_at?: string | null;
  created_at: string;
};

export type TSupabaseUserSession =
  | {
      user: User;
      session: Session;
    }
  | {
      user: null;
      session: null;
    };

export interface SupabaseAuthErrorProps {
  error: AuthError;
  data: TSupabaseUserSession;
  email: string;
}

export interface SupbaseAuthError {
  isError: boolean;
}
