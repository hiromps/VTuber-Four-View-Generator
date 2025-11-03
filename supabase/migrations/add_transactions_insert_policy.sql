-- Add INSERT policy for transactions table
CREATE POLICY IF NOT EXISTS "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
