-- ═══════════════════════════════════════════════════════
-- Qubitedge LMS — SAFE RE-RUNNABLE SCHEMA
-- ═══════════════════════════════════════════════════════

-- =====================
-- PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'intern',
  domain TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- EVENTS
-- =====================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- WEEKS (MODULES)
-- =====================
CREATE TABLE IF NOT EXISTS weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  week_number INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_visible BOOLEAN DEFAULT TRUE,
  order_index INT DEFAULT 0
);

DO $$ BEGIN
  ALTER TABLE weeks ADD CONSTRAINT unique_week_per_event UNIQUE (event_id, week_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================
-- DAYS
-- =====================
CREATE TABLE IF NOT EXISTS days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  resource_link TEXT,
  tutor_name TEXT,
  video_url TEXT
);

DO $$ BEGIN
  ALTER TABLE days ADD CONSTRAINT unique_day_per_week UNIQUE (week_id, day_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================
-- QUIZZES
-- =====================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES days(id) ON DELETE CASCADE UNIQUE,
  questions JSONB NOT NULL,
  max_score INT DEFAULT 10
);

-- =====================
-- SCORES
-- =====================
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB,
  UNIQUE(user_id, quiz_id)
);

-- =====================
-- ATTENDANCE
-- =====================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================
-- TASKS
-- =====================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  accepted_formats TEXT[] DEFAULT ARRAY['pdf','zip','github','text']
);

DO $$ BEGIN
  ALTER TABLE tasks ADD CONSTRAINT unique_task_per_day UNIQUE (day_id, title);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================
-- SUBMISSIONS
-- =====================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'pending',
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ANNOUNCEMENTS
-- =====================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  posted_by UUID REFERENCES profiles(id),
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- =====================
-- SITE SETTINGS
-- =====================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Settings
INSERT INTO site_settings (key, value)
VALUES ('show_previous_works', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- =====================
-- DROP OLD POLICIES (SAFE)
-- =====================
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename;
  END LOOP;
END $$;

-- =====================
-- ADMIN HELPER FUNCTION
-- =====================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================
-- PROFILES POLICIES
-- =====================
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    is_admin() OR auth.uid() = id
  );
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE TO authenticated
  USING (is_admin());
CREATE POLICY "profiles_admin_delete" ON profiles FOR DELETE TO authenticated
  USING (is_admin());

-- =====================
-- GENERIC ADMIN POLICIES
-- =====================
CREATE POLICY "events_select_all" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_admin_write" ON events FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "weeks_select_all" ON weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "weeks_admin_write" ON weeks FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "days_select_all" ON days FOR SELECT TO authenticated USING (true);
CREATE POLICY "days_admin_write" ON days FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY "quizzes_select_all" ON quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "quizzes_admin_write" ON quizzes FOR ALL TO authenticated
  USING (is_admin());

-- =====================
-- SCORES
-- =====================
CREATE POLICY "scores_select_own" ON scores FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "scores_insert_own" ON scores FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "quiz_day_lock" ON scores FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN days d ON d.id = q.day_id
      WHERE q.id = quiz_id
      AND d.date = CURRENT_DATE
    )
  );

-- =====================
-- ATTENDANCE
-- =====================
CREATE POLICY "attendance_select" ON attendance FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "attendance_insert_own" ON attendance FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================
-- TASKS
-- =====================
CREATE POLICY "tasks_select_all" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_admin_write" ON tasks FOR ALL TO authenticated
  USING (is_admin());

-- =====================
-- SUBMISSIONS
-- =====================
CREATE POLICY "submissions_select" ON submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "submissions_insert_own" ON submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "submissions_admin_update" ON submissions FOR UPDATE TO authenticated
  USING (is_admin());

-- =====================
-- ANNOUNCEMENTS
-- =====================
CREATE POLICY "announcements_select_all" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements_admin_write" ON announcements FOR ALL TO authenticated
  USING (is_admin());

-- =====================
-- SITE SETTINGS
-- =====================
CREATE POLICY "site_settings_select_all" ON site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_settings_admin_write" ON site_settings FOR ALL TO authenticated
  USING (is_admin());

-- ═══════════════════════════════════════════════════════
-- STORAGE
-- ═══════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "submissions_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "submissions_bucket_select" ON storage.objects;

CREATE POLICY "submissions_bucket_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "submissions_bucket_select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'submissions');

-- =====================
-- SEED DATA
-- =====================
INSERT INTO site_settings (key, value)
VALUES ('show_previous_works', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;