-- Add score column to project_submissions
ALTER TABLE "public"."project_submissions"
ADD COLUMN "score" integer DEFAULT NULL;
