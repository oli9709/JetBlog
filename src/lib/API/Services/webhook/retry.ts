import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { sendWebhook } from './send';

export async function retryFailedWebhooks() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: failed } = await supabase
    .from('webhooks')
    .select('*')
    .eq('is_active', true)
    .lt('last_status', 200)
    .lt('last_triggered_at', fifteenMinutesAgo)
    .lt('retry_count', 3);

  if (!failed?.length) return { retried: 0 };

  let retried = 0;
  for (const webhook of failed) {
    await supabase
      .from('webhooks')
      .update({ retry_count: webhook.retry_count + 1 })
      .eq('id', webhook.id);

    await sendWebhook({
      webhookId: webhook.id,
      endpointUrl: webhook.endpoint_url,
      secretKey: webhook.secret_key,
      event: 'article.published',
      payload: { retry: true, attempt: webhook.retry_count + 1 }
    });

    retried++;
  }

  return { retried };
}
