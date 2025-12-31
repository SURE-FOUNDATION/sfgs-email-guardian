-- Add failed_at column to email_queue
ALTER TABLE public.email_queue ADD COLUMN failed_at TIMESTAMP WITH TIME ZONE;
