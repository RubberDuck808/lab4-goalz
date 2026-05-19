-- Make the Photo bucket public so images are directly loadable in browsers
-- without signed URL tokens
UPDATE storage.buckets
SET public = true
WHERE id = 'Photo';
