-- ==============================================================================
-- HIREFLO: SUPABASE CLOUD DATABASE SCHEMA FOR MULTI-DEVICE AUTO-SYNC
-- Copy and paste this script directly into the Supabase SQL Editor.
-- ==============================================================================

-- 1. Create table for user synchronization payloads
CREATE TABLE IF NOT EXISTS public.user_sync_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_sync_data_user_id ON public.user_sync_data(user_id);

-- 3. Enable PostgreSQL Row-Level Security (RLS)
-- Crucial: Ensures candidates can ONLY read and write their own data.
ALTER TABLE public.user_sync_data ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for candidate privacy
CREATE POLICY "Users can view their own sync data"
  ON public.user_sync_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync data"
  ON public.user_sync_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync data"
  ON public.user_sync_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync data"
  ON public.user_sync_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Storage bucket for optional raw resume documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only owner can upload and download resumes
CREATE POLICY "Users can upload their own resume files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own resume files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
