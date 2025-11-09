-- ログイン試行回数を記録するテーブル
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON public.login_attempts(attempted_at);

-- アカウントロック情報を保存するテーブル
CREATE TABLE IF NOT EXISTS public.account_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE,
  reason TEXT DEFAULT 'Too many failed login attempts',
  unlock_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX idx_account_locks_email ON public.account_locks(email);
CREATE INDEX idx_account_locks_locked_until ON public.account_locks(locked_until);

-- 古いログイン試行記録を自動削除する関数（24時間以上前のデータ）
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 定期的に古いデータをクリーンアップするためのコメント
-- pg_cronを使用する場合:
-- SELECT cron.schedule('cleanup-login-attempts', '0 */6 * * *', 'SELECT public.cleanup_old_login_attempts()');

-- RLSを有効化（セキュリティ強化）
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_locks ENABLE ROW LEVEL SECURITY;

-- サービスロールのみアクセス可能にする
CREATE POLICY "Service role can manage login_attempts"
  ON public.login_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage account_locks"
  ON public.account_locks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
