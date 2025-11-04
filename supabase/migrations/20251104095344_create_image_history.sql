-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create image_history table
CREATE TABLE IF NOT EXISTS public.image_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('concept', 'character_sheet', 'facial_expressions')),

    -- Original input data
    prompt TEXT, -- For concept art
    aspect_ratio TEXT, -- For concept art
    additional_prompt TEXT, -- For character sheet and expressions

    -- Generated image URLs (stored in Supabase Storage)
    images JSONB NOT NULL, -- Structure: {"front": "url", "back": "url"} or {"joy": "url"} or single URL

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_image_history_user_id ON public.image_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON public.image_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_history_generation_type ON public.image_history(generation_type);

-- Enable RLS
ALTER TABLE public.image_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own history
CREATE POLICY "Users can view their own image history"
    ON public.image_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image history"
    ON public.image_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image history"
    ON public.image_history
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image history"
    ON public.image_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Storage policies for generated-images bucket
CREATE POLICY "Users can upload their own generated images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'generated-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own generated images"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'generated-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own generated images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'generated-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public access to generated images (if shared)
CREATE POLICY "Public can view generated images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'generated-images');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_image_history_updated_at ON public.image_history;
CREATE TRIGGER update_image_history_updated_at
    BEFORE UPDATE ON public.image_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
