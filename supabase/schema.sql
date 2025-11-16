-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  tokens INTEGER DEFAULT 5 NOT NULL CHECK (tokens >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Transaction types enum
CREATE TYPE transaction_type AS ENUM (
  'free_signup',
  'purchase',
  'generation_sheet',
  'generation_concept',
  'generation_expressions',
  'generation_pose',
  'generation_live2d_parts',
  'refund_sheet',
  'refund_expressions',
  'refund_pose',
  'refund_live2d_parts',
  'refund_concept'
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  stripe_session_id TEXT,
  package_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session_id ON public.transactions(stripe_session_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, tokens)
  VALUES (NEW.id, NEW.email, 5);

  -- Record the free signup transaction
  INSERT INTO public.transactions (user_id, type, amount, balance_after)
  VALUES (NEW.id, 'free_signup', 5, 5);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Image History table
CREATE TABLE IF NOT EXISTS public.image_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('concept', 'character_sheet', 'facial_expressions', 'pose_generation', 'live2d_parts')),

    -- Original input data
    prompt TEXT,
    aspect_ratio TEXT,
    additional_prompt TEXT,

    -- Generated image URLs (stored in Supabase Storage)
    images JSONB NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for image_history
CREATE INDEX IF NOT EXISTS idx_image_history_user_id ON public.image_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON public.image_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_history_generation_type ON public.image_history(generation_type);

-- Enable RLS for image_history
ALTER TABLE public.image_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_history
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

-- Trigger for image_history updated_at
DROP TRIGGER IF EXISTS update_image_history_updated_at ON public.image_history;
CREATE TRIGGER update_image_history_updated_at
    BEFORE UPDATE ON public.image_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

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

CREATE POLICY "Public can view generated images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'generated-images');
