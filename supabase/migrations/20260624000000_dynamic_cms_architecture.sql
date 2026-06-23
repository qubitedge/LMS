-- ═══════════════════════════════════════════════════════
-- Qubitedge LMS — DYNAMIC CMS ARCHITECTURE MIGRATION
-- ═══════════════════════════════════════════════════════

-- 1. EXTEND EVENTS TABLE
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'bootcamp' CHECK (type IN ('bootcamp', 'internship', 'workshop'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS has_attendance BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS has_projects BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS has_quizzes BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS has_capstone BOOLEAN DEFAULT TRUE;

-- 2. CREATE USER ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, event_id)
);

-- Enable RLS on user_enrollments
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- Create Policies for user_enrollments
CREATE POLICY "Admins can manage user enrollments" 
    ON public.user_enrollments 
    FOR ALL TO authenticated 
    USING (is_admin());

CREATE POLICY "Users can view own enrollments" 
    ON public.user_enrollments 
    FOR SELECT TO authenticated 
    USING (auth.uid() = user_id);

-- 3. CREATE MINI PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.mini_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    problem_statement TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    sql_concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
    python_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    tables TEXT[] DEFAULT ARRAY[]::TEXT[],
    example_reports TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_learned TEXT[] DEFAULT ARRAY[]::TEXT[],
    bonus TEXT,
    real_world_relevance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on mini_projects
ALTER TABLE public.mini_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies for mini_projects
CREATE POLICY "Admins can manage mini projects" 
    ON public.mini_projects 
    FOR ALL TO authenticated 
    USING (is_admin());

CREATE POLICY "Users can view all mini projects" 
    ON public.mini_projects 
    FOR SELECT TO authenticated 
    USING (true);

-- 4. SEED & INITIAL DATA MIGRATION
DO $$
DECLARE
    v_event_id UUID;
BEGIN
    -- Find or create default bootcamp event
    SELECT id INTO v_event_id FROM public.events WHERE title = 'Applied AI & Data Science Bootcamp' LIMIT 1;
    IF v_event_id IS NULL THEN
        INSERT INTO public.events (title, description, type, has_attendance, has_projects, has_quizzes, has_capstone)
        VALUES ('Applied AI & Data Science Bootcamp', 'Master Applied AI and Data Science.', 'bootcamp', true, true, true, true)
        RETURNING id INTO v_event_id;
    END IF;

    -- Enroll all existing interns
    INSERT INTO public.user_enrollments (user_id, event_id)
    SELECT id, v_event_id 
    FROM public.profiles 
    WHERE role = 'intern'
    ON CONFLICT (user_id, event_id) DO NOTHING;

    -- Seed dynamic mini-projects associated with default bootcamp event
    INSERT INTO public.mini_projects (id, event_id, name, problem_statement, features, sql_concepts, technologies, tables, example_reports, skills_learned, bonus, real_world_relevance)
    VALUES 
    (
        '00000000-0000-0000-0000-000000000001', v_event_id, 
        'Student Attendance Management System', 
        'Schools, colleges, and training institutes need a system to track student attendance, monitor participation, and generate attendance reports.',
        ARRAY['Student registration', 'Course creation', 'Daily attendance marking', 'Attendance history', 'Attendance percentage calculation', 'Absent student reports', 'Monthly attendance summaries'],
        ARRAY['INSERT, UPDATE, DELETE, SELECT', 'INNER JOIN', 'LEFT JOIN', 'COUNT()', 'GROUP BY', 'Aggregate Functions'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['students', 'courses', 'enrollments', 'attendance'],
        ARRAY['Students with attendance below 75%', 'Course-wise attendance report', 'Daily attendance summary'],
        ARRAY['CRUD Operations', 'Menu-driven programming', 'Relational database design'],
        NULL, NULL
    ),
    (
        '00000000-0000-0000-0000-000000000002', v_event_id, 
        'Personal Expense Tracker', 
        'Individuals often struggle to understand where their money goes each month.',
        ARRAY['Record expenses', 'Expense categories (Food, Transport, Utilities, Entertainment)', 'Monthly spending summary', 'Budget tracking', 'Search by date range', 'Search by category', 'Export reports'],
        ARRAY['SUM()', 'AVG()', 'GROUP BY', 'ORDER BY', 'Date Filtering'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['users', 'categories', 'expenses'],
        ARRAY['Total monthly expenses', 'Top spending category', 'Daily spending trends'],
        ARRAY['Data analysis', 'Reporting', 'Visualization'],
        'Generate charts using matplotlib or pandas', NULL
    ),
    (
        '00000000-0000-0000-0000-000000000003', v_event_id, 
        'Library Management System', 
        'Libraries need efficient tracking of books and borrowers.',
        ARRAY['Add books', 'Search books', 'Register members', 'Issue books', 'Return books', 'Calculate overdue books', 'Fine calculation'],
        ARRAY['Foreign Keys', 'JOIN Queries', 'Constraints'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['books', 'authors', 'members', 'book_issues'],
        ARRAY['Most borrowed books', 'Books overdue by more than 30 days', 'Active members'],
        ARRAY['Database relationships', 'Transaction management'],
        NULL, NULL
    ),
    (
        '00000000-0000-0000-0000-000000000004', v_event_id, 
        'Employee Payroll Management System', 
        'Organizations need to automate salary processing.',
        ARRAY['Employee records', 'Attendance tracking', 'Leave management', 'Salary calculations', 'Payslip generation', 'Tax deductions', 'Bonus calculations'],
        ARRAY['Views', 'Aggregations', 'Filtering', 'Calculated Columns'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['employees', 'attendance', 'leaves', 'payroll'],
        ARRAY['Monthly payroll report', 'Employee attendance summary', 'Leave balances'],
        ARRAY['Business calculations', 'Report generation'],
        'Export payslips to PDF.', NULL
    ),
    (
        '00000000-0000-0000-0000-000000000005', v_event_id, 
        'Quiz Management Application', 
        'Online learning platforms require quiz systems to assess learners.',
        ARRAY['Create questions', 'Categorize questions', 'Random quiz generation', 'Time-limited quizzes', 'Score calculation', 'Leaderboard'],
        ARRAY['COUNT()', 'ORDER BY RANDOM()', 'Ranking Queries'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['users', 'questions', 'quizzes', 'quiz_attempts'],
        ARRAY['Top scorers', 'Question difficulty analysis'],
        ARRAY['Randomization', 'Game logic', 'Ranking systems'],
        'Build GUI using Tkinter', NULL
    ),
    (
        '00000000-0000-0000-0000-000000000006', v_event_id, 
        'Online Course Enrollment System', 
        'Training institutes need to manage student enrollments and course registrations.',
        ARRAY['Student registration', 'Course management', 'Enrollment management', 'Course completion tracking', 'Certificate eligibility'],
        ARRAY['Junction Tables', 'Many-to-Many Relationships', 'JOIN Queries'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['students', 'courses', 'enrollments'],
        ARRAY['Most popular courses', 'Student enrollment history'],
        ARRAY['Advanced database relationships'],
        NULL, NULL
    ),
    (
        '00000000-0000-0000-0000-000000000007', v_event_id, 
        'Inventory Management System', 
        'Businesses need to monitor stock levels and sales.',
        ARRAY['Product management', 'Inventory tracking', 'Stock updates', 'Low-stock alerts', 'Supplier management', 'Sales tracking'],
        ARRAY['Transactions', 'Triggers', 'Aggregate Calculations'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['products', 'suppliers', 'inventory_transactions', 'sales'],
        ARRAY['Current inventory', 'Fast-moving products', 'Low-stock report'],
        ARRAY['Inventory accounting', 'Transaction processing'],
        NULL, 'Useful for: Retail shops, Warehouses, Pharmacies'
    ),
    (
        '00000000-0000-0000-0000-000000000008', v_event_id, 
        'Hospital Appointment Management System', 
        'Hospitals need efficient scheduling and patient management.',
        ARRAY['Patient registration', 'Doctor profiles', 'Appointment booking', 'Rescheduling appointments', 'Appointment search', 'Daily schedules'],
        ARRAY['Constraints', 'Date Functions', 'Time Queries'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['patients', 'doctors', 'appointments', 'departments'],
        ARRAY['Today''s appointments', 'Doctor workload report'],
        ARRAY['Scheduling systems', 'Time-based queries'],
        NULL, NULL
    ),
    (
        '00000000-0000-0000-0000-000000000009', v_event_id, 
        'Movie Recommendation & Rating System', 
        'Streaming platforms use ratings to recommend content.',
        ARRAY['Add movies', 'Add genres', 'User ratings', 'Review management', 'Top-rated movies', 'Genre filtering'],
        ARRAY['AVG()', 'GROUP BY', 'Sorting', 'Ranking'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['movies', 'genres', 'users', 'ratings'],
        ARRAY['Top 10 rated movies', 'Best movies by genre'],
        ARRAY['Recommendation logic', 'Rating aggregation'],
        'Integrate with: OMDb API', NULL
    ),
    (
        '00000000-0000-0000-0000-000000000010', v_event_id, 
        'Mini E-Commerce Backend', 
        'An online store requires product management, customer management, and order processing.',
        ARRAY['Customer accounts', 'Product catalog', 'Shopping cart', 'Order placement', 'Order history', 'Inventory updates'],
        ARRAY['Complex JOINs', 'Transactions', 'Normalization', 'Aggregate Queries'],
        ARRAY['Python', 'SQLite', 'Menu-driven App'],
        ARRAY['users', 'products', 'cart', 'orders', 'order_items', 'payments'],
        ARRAY['Best-selling products', 'Customer purchase history', 'Monthly revenue'],
        ARRAY['Real-world database design', 'E-commerce workflows', 'Order management'],
        NULL, NULL
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 5. UPDATE ATTENDANCE TABLE REFERENCE
-- Drop global UNIQUE(user_id, date) constraint dynamically
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.attendance'::regclass 
          AND contype = 'u' 
          AND conkey = ARRAY[
              (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.attendance'::regclass AND attname = 'user_id'),
              (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.attendance'::regclass AND attname = 'date')
          ]
    LOOP
        EXECUTE 'ALTER TABLE public.attendance DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Add event_id column to attendance
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- Populate existing attendance records with default bootcamp event ID
DO $$
DECLARE
    v_event_id UUID;
BEGIN
    SELECT id INTO v_event_id FROM public.events WHERE title = 'Applied AI & Data Science Bootcamp' LIMIT 1;
    IF v_event_id IS NOT NULL THEN
        UPDATE public.attendance SET event_id = v_event_id WHERE event_id IS NULL;
    END IF;
END $$;

-- Enforce NOT NULL on attendance.event_id
ALTER TABLE public.attendance ALTER COLUMN event_id SET NOT NULL;

-- Add new unique constraint UNIQUE(user_id, event_id, date)
DO $$
BEGIN
    ALTER TABLE public.attendance ADD CONSTRAINT unique_user_event_date UNIQUE (user_id, event_id, date);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 6. MIGRATE PROJECT SUBMISSIONS TO UUID REFERENCE
-- Drop old project_submissions unique constraint
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.project_submissions'::regclass 
          AND contype = 'u' 
          AND conkey = ARRAY[
              (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.project_submissions'::regclass AND attname = 'user_id'),
              (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.project_submissions'::regclass AND attname = 'project_id')
          ]
    LOOP
        EXECUTE 'ALTER TABLE public.project_submissions DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Add temporary column for UUID
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS project_uuid UUID REFERENCES public.mini_projects(id) ON DELETE CASCADE;

-- Map project integer IDs to seeded UUIDs
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000001'::uuid WHERE project_id = 1;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000002'::uuid WHERE project_id = 2;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000003'::uuid WHERE project_id = 3;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000004'::uuid WHERE project_id = 4;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000005'::uuid WHERE project_id = 5;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000006'::uuid WHERE project_id = 6;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000007'::uuid WHERE project_id = 7;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000008'::uuid WHERE project_id = 8;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000009'::uuid WHERE project_id = 9;
UPDATE public.project_submissions SET project_uuid = '00000000-0000-0000-0000-000000000010'::uuid WHERE project_id = 10;

-- Drop old project_id column
ALTER TABLE public.project_submissions DROP COLUMN project_id;

-- Rename project_uuid to project_id and make NOT NULL
ALTER TABLE public.project_submissions RENAME COLUMN project_uuid TO project_id;
ALTER TABLE public.project_submissions ALTER COLUMN project_id SET NOT NULL;

-- Add new unique constraint for project submissions
ALTER TABLE public.project_submissions ADD CONSTRAINT unique_user_project UNIQUE (user_id, project_id);
