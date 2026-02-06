-- Migration: Setup Supabase Storage for board documents
-- Description: Creates the storage bucket and sets up RLS policies
-- Author: Board.Africa
-- Date: 2026-01-28

-- 1. Create a storage bucket for board documents
-- Note: 'public': false means it's a private bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'board-africa-documents', 
  'board-africa-documents', 
  false, 
  52428800, -- 50MB limit
  '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS policies for storage.objects
-- Allow users to upload files to their organization's path
-- We expect the file path format to be: organization_id/filename.ext
CREATE POLICY "Users can upload organization documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'board-africa-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view/download files in their organization's path
CREATE POLICY "Users can view organization documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'board-africa-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete files in their organization's path
CREATE POLICY "Users can delete organization documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'board-africa-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update files in their organization's path
CREATE POLICY "Users can update organization documents"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (
  bucket_id = 'board-africa-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
