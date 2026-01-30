-- Migration: Create storage bucket for image uploads
-- This replaces local filesystem storage for Vercel deployment

-- Create the uploads bucket (public access for reading)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,  -- public bucket for serving images
  5242880,  -- 5MB limit per file
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy: Allow anyone to read files (public access)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Authenticated delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');
