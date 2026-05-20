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
}: SendWebhookParams): Promise<{ success: boolean; status: number }> {
  const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
  const signature = 'sha256=' + crypto.createHmac('sha256', secretKey).update(body).digest('hex');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let status = 0;
  try {
    const res = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-JetBlog-Signature': signature,
        'X-JetBlog-Event': event
      },
      body,
      signal: controller.signal
    });
    status = res.status;
  } catch {
    status = 0;
  } finally {
    clearTimeout(timeout);
  }

  const success = status >= 200 && status < 300;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase
    .from('webhooks')
    .update({
      last_status: status,
      last_triggered_at: new Date().toISOString(),
      retry_count: success ? 0 : undefined
    })
    .eq('id', webhookId);

  return { success, status };
}
