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

export type SiteT = {
  id: string;
  user_id: string;
  url: string;
  wp_username: string;
  wp_password?: string; // Shifrlangan REST API paroli (faqat serverda ishlatiladi)
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
  featured_image_url?: string | null;
  wp_post_id?: number | null;
  status: 'draft' | 'scheduled' | 'published' | 'error';
  scheduled_for?: string | null;
  published_at?: string | null;
  ai_tokens_used: number;
  error_message?: string | null;
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
