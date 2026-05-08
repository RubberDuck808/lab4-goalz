-- Ensure the Photo bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('Photo', 'Photo', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous (anon key) uploads to the Photo bucket
CREATE POLICY "anon_upload_photo"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'Photo');

-- Allow anonymous reads (needed for signed URL generation)
CREATE POLICY "anon_select_photo"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'Photo');
