-- Add normalized_email column to users table for alias prevention
-- This migration adds a normalized email column to prevent users from creating
-- multiple accounts using email aliases like user+1@gmail.com, user+2@gmail.com, etc.

-- Step 1: Add normalized_email column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS normalized_email TEXT;

-- Step 2: Create a function to normalize email addresses
CREATE OR REPLACE FUNCTION public.normalize_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
  local_part TEXT;
  domain TEXT;
  normalized_local TEXT;
BEGIN
  -- Validate and split email
  IF email IS NULL OR email = '' THEN
    RETURN NULL;
  END IF;

  -- Convert to lowercase and trim
  email := LOWER(TRIM(email));

  -- Split email into local part and domain
  local_part := SPLIT_PART(email, '@', 1);
  domain := SPLIT_PART(email, '@', 2);

  -- Domain-specific normalization
  CASE
    -- Gmail: Remove '+' aliases and dots
    WHEN domain IN ('gmail.com', 'googlemail.com') THEN
      normalized_local := SPLIT_PART(local_part, '+', 1);
      normalized_local := REPLACE(normalized_local, '.', '');

    -- Outlook/Hotmail: Remove '+' aliases
    WHEN domain IN ('outlook.com', 'hotmail.com', 'live.com', 'msn.com') THEN
      normalized_local := SPLIT_PART(local_part, '+', 1);

    -- Yahoo: Remove '-' aliases
    WHEN domain IN ('yahoo.com', 'yahoo.co.jp', 'ymail.com') THEN
      normalized_local := SPLIT_PART(local_part, '-', 1);

    -- Other providers: Remove '+' aliases (general case)
    ELSE
      normalized_local := SPLIT_PART(local_part, '+', 1);
  END CASE;

  RETURN normalized_local || '@' || domain;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 3: Update existing users with normalized emails
UPDATE public.users
SET normalized_email = public.normalize_email(email)
WHERE normalized_email IS NULL;

-- Step 4: Make normalized_email NOT NULL and UNIQUE
ALTER TABLE public.users
ALTER COLUMN normalized_email SET NOT NULL;

-- Create unique index on normalized_email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_normalized_email
ON public.users(normalized_email);

-- Step 5: Update the handle_new_user function to include normalized_email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  normalized_email_value TEXT;
  existing_user_count INTEGER;
BEGIN
  -- Normalize the email
  normalized_email_value := public.normalize_email(NEW.email);

  -- Check if a user with this normalized email already exists
  SELECT COUNT(*) INTO existing_user_count
  FROM public.users
  WHERE normalized_email = normalized_email_value;

  -- If user already exists with this normalized email, prevent creation
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'An account with this email address already exists (aliases are not allowed)';
  END IF;

  -- Insert new user with normalized email
  INSERT INTO public.users (id, email, normalized_email, tokens)
  VALUES (NEW.id, NEW.email, normalized_email_value, 5);

  -- Record the free signup transaction
  INSERT INTO public.transactions (user_id, type, amount, balance_after)
  VALUES (NEW.id, 'free_signup', 5, 5);

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If unique constraint is violated, raise a more user-friendly error
    RAISE EXCEPTION 'An account with this email address already exists (aliases are not allowed)';
  WHEN OTHERS THEN
    -- Re-raise other exceptions
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON COLUMN public.users.normalized_email IS 'Normalized email address to prevent alias abuse (e.g., user+1@gmail.com)';
COMMENT ON FUNCTION public.normalize_email(TEXT) IS 'Normalizes email addresses by removing provider-specific aliases';
