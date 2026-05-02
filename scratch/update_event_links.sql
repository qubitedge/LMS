-- 1. Add external_link column to events table if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_link TEXT;

-- 2. Rename the workshop
UPDATE events SET title = 'Data Workshop' WHERE title = 'Previous Data Workshop';

-- 3. Set the external link for Data Workshop (redirecting to curriculum as requested)
UPDATE events 
SET external_link = '/progress' 
WHERE title = 'Data Workshop';

-- 4. Set the external link for Quantum Workshop (direct video link)
UPDATE events 
SET external_link = 'https://youtu.be/q2mOLaAenwI?si=VUDT879rTShM2yhQ' 
WHERE title = 'Quantum Workshop';
