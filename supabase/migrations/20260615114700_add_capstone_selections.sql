-- Create capstone_selections table
CREATE TABLE IF NOT EXISTS public.capstone_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    domain TEXT NOT NULL CHECK (domain IN ('AI/ML', 'Python', 'Data Analytics', 'IoT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.capstone_selections ENABLE ROW LEVEL SECURITY;

-- Interns can read their own selections
CREATE POLICY "Users can read own capstone selections"
    ON public.capstone_selections
    FOR SELECT
    USING (auth.uid() = user_id);

-- Interns can insert their own selections
CREATE POLICY "Users can insert own capstone selections"
    ON public.capstone_selections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all selections
CREATE POLICY "Admins can view all capstone selections"
    ON public.capstone_selections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
