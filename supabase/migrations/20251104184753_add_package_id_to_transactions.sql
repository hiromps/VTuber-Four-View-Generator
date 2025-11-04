-- Add package_id column to transactions table
-- This allows tracking which specific token package was purchased

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS package_id TEXT;

-- Create index for faster lookups when checking if a user purchased a specific package
CREATE INDEX IF NOT EXISTS idx_transactions_package_id
ON public.transactions(user_id, package_id)
WHERE type = 'purchase';

-- Add comment to explain the column
COMMENT ON COLUMN public.transactions.package_id IS 'ID of the token package purchased (e.g., 5_tokens_first_time, 10_tokens, etc.)';
