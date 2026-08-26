-- Phase 10: Theatre Admin and 3D Configuration

-- Add physical dimensions to auditoriums
ALTER TABLE auditoriums 
ADD COLUMN screen_width NUMERIC(10,2) DEFAULT 24.0,
ADD COLUMN screen_height NUMERIC(10,2) DEFAULT 10.0,
ADD COLUMN room_width NUMERIC(10,2) DEFAULT 50.0,
ADD COLUMN room_depth NUMERIC(10,2) DEFAULT 60.0,
ADD COLUMN room_height NUMERIC(10,2) DEFAULT 20.0,
ADD COLUMN model_url TEXT,
ADD COLUMN is_published BOOLEAN DEFAULT false;

-- Add rotation to seats
ALTER TABLE seats
ADD COLUMN rot_x DOUBLE PRECISION DEFAULT 0,
ADD COLUMN rot_y DOUBLE PRECISION DEFAULT 0,
ADD COLUMN rot_z DOUBLE PRECISION DEFAULT 0;

-- Create storage bucket for theatre models
INSERT INTO storage.buckets (id, name, public) 
VALUES ('theatre-models', 'theatre-models', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'theatre-models');

CREATE POLICY "Admin Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'theatre-models' 
    AND (auth.role() = 'authenticated')
);

CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE 
WITH CHECK (
    bucket_id = 'theatre-models' 
    AND (auth.role() = 'authenticated')
);

CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'theatre-models' 
    AND (auth.role() = 'authenticated')
);
