-- 1. Remove the AI Data Science Bootcamp as requested
DELETE FROM events WHERE title = 'AI Data Science Bootcamp';

-- 2. Ensure Quantum Workshop and Previous Data Workshop are marked as COMPLETED
-- We do this by creating a past module for each
DO $$ 
DECLARE 
    quantum_id UUID;
    prev_data_id UUID;
BEGIN
    SELECT id INTO quantum_id FROM events WHERE title = 'Quantum Workshop' LIMIT 1;
    SELECT id INTO prev_data_id FROM events WHERE title = 'Previous Data Workshop' LIMIT 1;

    -- Update Quantum Workshop Module (Past Date)
    IF quantum_id IS NOT NULL THEN
        -- Create a module in the past
        INSERT INTO weeks (event_id, title, week_number, start_date, end_date, is_visible)
        VALUES (quantum_id, 'Quantum Foundations', 1, '2025-01-01', '2025-01-07', true)
        ON CONFLICT (event_id, week_number) DO UPDATE SET end_date = '2025-01-07';

        -- Add the Video Day
        INSERT INTO days (week_id, day_number, topic, video_url, tutor_name, description)
        VALUES (
            (SELECT id FROM weeks WHERE event_id = quantum_id LIMIT 1), 
            1, 
            'Quantum Computing Workshop Session', 
            'https://youtu.be/q2mOLaAenwI?si=VUDT879rTShM2yhQ', 
            'QubitEdge Expert',
            'Full recording of the Quantum Computing and Algorithm exploration workshop.'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- Update Previous Data Workshop Module (Past Date)
    IF prev_data_id IS NOT NULL THEN
        INSERT INTO weeks (event_id, title, week_number, start_date, end_date, is_visible)
        VALUES (prev_data_id, 'Data Analytics Archive', 1, '2024-12-01', '2024-12-07', true)
        ON CONFLICT (event_id, week_number) DO UPDATE SET end_date = '2024-12-07';
    END IF;
END $$;
