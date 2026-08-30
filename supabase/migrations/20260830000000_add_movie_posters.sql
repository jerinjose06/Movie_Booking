-- Add poster_url to movies
ALTER TABLE movies ADD COLUMN IF NOT EXISTS poster_url TEXT;

-- Create storage bucket for posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for posters bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posters');

-- Admins can insert/update/delete (we use service role in backend, so it bypasses RLS, but just in case we add one for authenticated users)
CREATE POLICY "Authenticated users can upload posters" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posters' AND auth.role() = 'authenticated');
