-- 1. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns to weeks
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;

-- 3. Create a default event for existing data
INSERT INTO events (title, description)
VALUES ('Applied AI Bootcamp', 'Main bootcamp curriculum')
ON CONFLICT DO NOTHING;

-- 4. Link existing weeks to the default event
-- This assumes the first event created is the bootcamp.
-- In a real scenario, you might want to be more specific.
UPDATE weeks 
SET event_id = (SELECT id FROM events WHERE title = 'Applied AI Bootcamp' LIMIT 1)
WHERE event_id IS NULL;

-- 5. Update constraints (Drop old one and add new one)
ALTER TABLE weeks DROP CONSTRAINT IF EXISTS unique_week_per_domain;
DO $$ BEGIN
  ALTER TABLE weeks ADD CONSTRAINT unique_week_per_event UNIQUE (event_id, week_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Enable RLS and add policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select_all" ON events;
CREATE POLICY "events_select_all" ON events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "events_admin_write" ON events;
CREATE POLICY "events_admin_write" ON events FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
