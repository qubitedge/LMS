-- 1. Create specific events
INSERT INTO events (title, description, is_active)
VALUES 
  ('Previous Data Workshop', 'Historical data science and analytics workshop archives.', true),
  ('Quantum Workshop', 'Advanced quantum computing and algorithm exploration.', true),
  ('AI Data Science Bootcamp', 'Present comprehensive bootcamp for Artificial Intelligence and Data Science.', true)
ON CONFLICT DO NOTHING;

-- 2. Link any unassigned weeks to the AI Data Science Bootcamp (as it is the current one)
UPDATE weeks 
SET event_id = (SELECT id FROM events WHERE title = 'AI Data Science Bootcamp' LIMIT 1)
WHERE event_id IS NULL;
