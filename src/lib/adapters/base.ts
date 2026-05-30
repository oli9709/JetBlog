import 'server-only';

export type ArticlePayload = {
  title: string;
  content: string;           // HTML
  featuredImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
};

export type PublishResult = {
  postId: string;
  url: string;
};

export type VerifyResult = {
  ok: boolean;
  error?: string;
};

export interface SiteAdapter {
  verify(): Promise<VerifyResult>;
  publish(article: ArticlePayload): Promise<PublishResult>;
}
