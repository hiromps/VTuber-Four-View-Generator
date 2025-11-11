-- レート制限を記録するテーブル
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- IPアドレスまたはユーザーID
  endpoint VARCHAR(50) NOT NULL, -- エンドポイントタイプ (auth, payment, generation, general)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX idx_rate_limits_endpoint ON public.rate_limits(endpoint);
CREATE INDEX idx_rate_limits_created_at ON public.rate_limits(created_at);
CREATE INDEX idx_rate_limits_composite ON public.rate_limits(identifier, endpoint, created_at);

-- IPアドレスブロックリストテーブル
CREATE TABLE IF NOT EXISTS public.ip_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE, -- NULLの場合は永久ブロック
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX idx_ip_blocklist_ip ON public.ip_blocklist(ip_address);
CREATE INDEX idx_ip_blocklist_blocked_until ON public.ip_blocklist(blocked_until);

-- 古いレート制限記録を自動削除する関数（24時間以上前のデータ）
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 期限切れのIPブロックを削除する関数
CREATE OR REPLACE FUNCTION public.cleanup_expired_ip_blocks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ip_blocklist
  WHERE blocked_until IS NOT NULL
    AND blocked_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLSを有効化（セキュリティ強化）
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_blocklist ENABLE ROW LEVEL SECURITY;

-- サービスロールのみアクセス可能にする
CREATE POLICY "Service role can manage rate_limits"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage ip_blocklist"
  ON public.ip_blocklist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 定期的にクリーンアップするためのコメント
-- pg_cronを使用する場合:
-- SELECT cron.schedule('cleanup-rate-limits', '0 */6 * * *', 'SELECT public.cleanup_old_rate_limits()');
-- SELECT cron.schedule('cleanup-ip-blocks', '0 0 * * *', 'SELECT public.cleanup_expired_ip_blocks()');
