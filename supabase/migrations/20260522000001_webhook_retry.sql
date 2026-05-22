CREATE OR REPLACE FUNCTION increment_retry_count(webhook_id uuid)
RETURNS void AS $$
  UPDATE webhooks
  SET retry_count = retry_count + 1
  WHERE id = webhook_id;
$$ LANGUAGE SQL SECURITY DEFINER;
