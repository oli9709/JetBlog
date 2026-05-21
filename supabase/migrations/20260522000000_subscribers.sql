CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert), only service role can read
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);
