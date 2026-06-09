-- Add admin_comment and has_seen_review to project_submissions table
ALTER TABLE public.project_submissions
ADD COLUMN IF NOT EXISTS admin_comment TEXT,
ADD COLUMN IF NOT EXISTS has_seen_review BOOLEAN DEFAULT false;
