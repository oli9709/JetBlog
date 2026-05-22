import 'server-only';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

interface SendWebhookParams {
  webhookId: string;
  endpointUrl: string;
  secretKey: string;
  event: string;
  payload: Record<string, any>;
}

export async function sendWebhook({
  webhookId,
  endpointUrl,
  secretKey,
  event,
  payload
}: SendWebhookParams): Promise<{ success: boolean; status?: number; error?: string }> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 sekund

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let lastError: string = 'Unknown error';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
      const signature = 'sha256=' + crypto.createHmac('sha256', secretKey).update(body).digest('hex');

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-JetBlog-Signature': signature,
          'X-JetBlog-Event': event
        },
        body,
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        // Muvaffaqiyatli — retry_count 0 ga tushirish
        await supabase
          .from('webhooks')
          .update({
            retry_count: 0,
            last_status: response.status,
            last_triggered_at: new Date().toISOString()
          })
          .eq('id', webhookId);

        return { success: true, status: response.status };
      }

      lastError = `HTTP ${response.status}`;

    } catch (error: any) {
      lastError = error?.message ?? 'Fetch failed';
    }

    // Oxirgi urinish emas — kuting (1s, 2s, ...)
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }

  // 3 ta urinish ham muvaffaqiyatsiz — retry_count ni +1 oshirish
  await supabase.rpc('increment_retry_count', { webhook_id: webhookId });

  await supabase
    .from('webhooks')
    .update({
      last_status: 0,
      last_triggered_at: new Date().toISOString()
    })
    .eq('id', webhookId);

  return { success: false, error: lastError };
}
