-- Add performance_percentage to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS performance_percentage INTEGER DEFAULT 0;

-- Create project_submissions table
CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL,
    project_name TEXT NOT NULL,
    github_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Interns can read their own submissions
CREATE POLICY "Users can read own project submissions"
    ON public.project_submissions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Interns can insert their own submissions
CREATE POLICY "Users can insert own project submissions"
    ON public.project_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all project submissions"
    ON public.project_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update submissions
CREATE POLICY "Admins can update project submissions"
    ON public.project_submissions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
