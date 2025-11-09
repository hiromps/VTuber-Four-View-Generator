# セキュリティ実装ガイド

このドキュメントは、Stripeのセキュリティ要件を満たすために実装したセキュリティ機能について説明します。

## 実装済みのセキュリティ機能

### 1. ログイン試行回数制限とアカウントロック ✅

**要件**: 管理者画面のログインフォームでは、アカウントロック機能を有効にし、10回以下のログイン失敗でアカウントをロックする。

**実装内容**:
- ログイン試行回数: 最大10回（15分間）
- アカウントロック時間: 30分間
- IPアドレスとメールアドレスの両方で監視
- 自動的に失敗記録をクリーンアップ（24時間後）

**関連ファイル**:
- `lib/auth/login-attempts.ts` - ログイン試行管理ライブラリ
- `app/api/auth/login/route.ts` - ログインAPI（アカウントロック統合）
- `supabase/migrations/20251109_add_login_attempts.sql` - データベーステーブル

**使用方法**:
```typescript
import {
  isAccountLocked,
  checkAndLockIfNeeded,
  recordLoginAttempt
} from '@/lib/auth/login-attempts'

// ログイン前にアカウントロックをチェック
const locked = await isAccountLocked(email)
if (locked) {
  // アカウントがロックされている
}

// ログイン失敗を記録
await recordLoginAttempt({
  email,
  ip_address: ipAddress,
  success: false,
})

// 必要に応じてアカウントをロック
const { shouldLock, remainingAttempts } = await checkAndLockIfNeeded(email, ipAddress)
```

### 2. IPアドレス制限とレート制限 ✅

**要件**: 不審なIPアドレスからのアクセス制限

**実装内容**:
- **認証エンドポイント**: 15分間に5回まで
- **決済エンドポイント**: 1時間に10回まで
- **画像生成エンドポイント**: 1時間に50回まで
- **一般APIエンドポイント**: 15分間に100回まで
- IPブロックリスト機能（永久または期限付き）

**関連ファイル**:
- `lib/rate-limit.ts` - レート制限ライブラリ
- `middleware.ts` - レート制限とIPブロックのチェック
- `supabase/migrations/20251109_add_rate_limiting.sql` - データベーステーブル

**使用方法**:
```typescript
import { checkRateLimit, addToBlocklist } from '@/lib/rate-limit'

// レート制限をチェック
const result = await checkRateLimit(ipAddress, 'auth')
if (!result.allowed) {
  // レート制限に達した
}

// IPをブロックリストに追加（1時間）
await addToBlocklist(ipAddress, 'Suspicious activity', 60 * 60 * 1000)

// IPをブロックリストに追加（永久）
await addToBlocklist(ipAddress, 'Malicious behavior')
```

### 3. セキュリティヘッダーとファイル露出対策 ✅

**要件**: 公開ディレクトリには重要なファイルを配置しない

**実装内容**:
- **セキュリティヘッダー**:
  - `X-Content-Type-Options: nosniff` - MIMEタイプスニッフィング防止
  - `X-Frame-Options: DENY` - クリックジャッキング防止
  - `X-XSS-Protection: 1; mode=block` - XSS攻撃防止
  - `Strict-Transport-Security` - HTTPS強制
  - `Content-Security-Policy` - コンテンツセキュリティポリシー
  - `Referrer-Policy` - リファラー情報の制限

- **ファイル保護**:
  - `.env` ファイルへのアクセス拒否
  - `.sql` ファイルへのアクセス拒否
  - `.md` ドキュメントファイルへのアクセス拒否
  - `.gitignore` で機密ファイルを除外

**関連ファイル**:
- `next.config.js` - Next.jsセキュリティヘッダー
- `vercel.json` - Vercelセキュリティ設定
- `.gitignore` - Git除外ファイル

### 4. エラーメッセージの非表示化 ✅

**要件**: エラー時に、エラー内容が分からないようにエラー内容を非表示にする

**実装内容**:
- 認証エラー時に一般的なメッセージを表示
- 詳細なエラー情報はサーバーログのみに記録
- ユーザーには「ログインに失敗しました」などの汎用メッセージ

**例**:
```typescript
// 詳細なエラーをログに記録
console.error('Magic link error:', error)

// ユーザーには一般的なメッセージを返す
return NextResponse.json(
  { error: getTranslation(request, 'auth.loginFailed') },
  { status: 400 }
)
```

### 5. 二要素認証（2FA）の推奨実装

**要件**: 二段階認証または二要素認証を採用する

**実装方法** (Supabase Auth MFA):

Supabaseは組み込みの2FA機能を提供しています。以下の手順で有効化できます。

1. **Supabaseダッシュボードで2FAを有効化**:
   - [Supabase Dashboard](https://app.supabase.com/) → Authentication → Settings
   - "Enable Phone Auth" または "Enable TOTP" を有効化

2. **フロントエンドで2FAを実装**:

```typescript
// TOTP（Time-based One-Time Password）の設定
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 2FAを有効化
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
})

// QRコードを表示してユーザーに設定させる
const qrCode = data?.totp.qr_code
const secret = data?.totp.secret

// 確認コードを検証
const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
  factorId: data?.id,
  challengeId: challenge.id,
  code: '123456', // ユーザーが入力したコード
})
```

3. **ログイン時の2FA検証**:

```typescript
// サインイン後、2FAが必要な場合
const { data: factors } = await supabase.auth.mfa.listFactors()

if (factors && factors.totp.length > 0) {
  // 2FAチャレンジを作成
  const { data: challenge } = await supabase.auth.mfa.challenge({
    factorId: factors.totp[0].id,
  })

  // ユーザーに確認コードを入力させる
  const { data, error } = await supabase.auth.mfa.verify({
    factorId: factors.totp[0].id,
    challengeId: challenge.id,
    code: userEnteredCode,
  })
}
```

**参考リンク**:
- [Supabase MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)

## データベーステーブル

### login_attempts
ログイン試行を記録するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| email | VARCHAR(255) | ログイン試行メールアドレス |
| ip_address | VARCHAR(45) | IPアドレス |
| attempted_at | TIMESTAMP | 試行日時 |
| success | BOOLEAN | 成功/失敗 |
| user_agent | TEXT | ユーザーエージェント |

### account_locks
アカウントロック情報を保存するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| email | VARCHAR(255) | メールアドレス（一意） |
| locked_at | TIMESTAMP | ロック開始時刻 |
| locked_until | TIMESTAMP | ロック解除時刻 |
| reason | TEXT | ロック理由 |

### rate_limits
レート制限を記録するテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| identifier | VARCHAR(255) | IPアドレスまたはユーザーID |
| endpoint | VARCHAR(50) | エンドポイントタイプ |
| metadata | JSONB | メタデータ |
| created_at | TIMESTAMP | 記録日時 |

### ip_blocklist
IPブロックリストテーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| ip_address | VARCHAR(45) | IPアドレス（一意） |
| reason | TEXT | ブロック理由 |
| blocked_until | TIMESTAMP | ブロック解除時刻（NULLは永久） |

## Stripe要件チェックリスト

### ✅ 実装済み

- [x] ベーシック認証等のアクセス制限（IPブロックリスト、レート制限）
- [x] ログイン試行回数制限（10回以下でアカウントロック）
- [x] 不審なIPアドレスからのアクセス制限
- [x] エラー内容の非表示化（一般的なエラーメッセージ）
- [x] セキュリティヘッダーの設定
- [x] ファイル露出対策（.env、.sqlファイルの保護）

### 📝 推奨実装（オプション）

- [ ] 二要素認証（2FA/MFA）- Supabase Auth MFAで実装可能
- [ ] SMS通知（ログイン時の通知）
- [ ] 指紋認証（WebAuthn API）

### 🔄 Stripe側で自動対応

- [x] 有効性確認の回数制限 - Stripe Radarが自動対応
- [x] 不正検知システム - Stripe Radarが自動対応
- [x] EMV 3-D セキュア - Stripeが自動対応

## デプロイ時の設定

### 1. Supabaseマイグレーションの適用

```bash
# マイグレーションを適用
supabase db push

# または、Supabase Dashboardから手動で実行
# SQL Editor → 各マイグレーションファイルの内容をコピー＆実行
```

### 2. 環境変数の設定（Vercel）

Vercelダッシュボードで以下の環境変数を設定：

```
NEXT_PUBLIC_SITE_URL=https://smartgram.online/
NEXT_PUBLIC_APP_URL=https://smartgram.online/
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. 定期クリーンアップの設定（オプション）

Supabase pg_cronを使用して定期的にクリーンアップ:

```sql
-- 6時間ごとにログイン試行記録をクリーンアップ
SELECT cron.schedule(
  'cleanup-login-attempts',
  '0 */6 * * *',
  'SELECT public.cleanup_old_login_attempts()'
);

-- 6時間ごとにレート制限記録をクリーンアップ
SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 */6 * * *',
  'SELECT public.cleanup_old_rate_limits()'
);

-- 毎日期限切れのIPブロックを削除
SELECT cron.schedule(
  'cleanup-ip-blocks',
  '0 0 * * *',
  'SELECT public.cleanup_expired_ip_blocks()'
);
```

## 監視とアラート

### 推奨する監視項目

1. **ログイン失敗率の監視**
   - 異常な失敗回数の増加を検知

2. **レート制限違反の監視**
   - 特定のIPからの大量リクエストを検知

3. **アカウントロックの監視**
   - ロックされたアカウント数の増加を検知

4. **不審なIPアドレスの検出**
   - 複数のアカウントへの試行を検知

### Supabase Dashboardでの確認方法

```sql
-- 最近のログイン失敗
SELECT email, ip_address, attempted_at, user_agent
FROM public.login_attempts
WHERE success = false
ORDER BY attempted_at DESC
LIMIT 50;

-- 現在ロックされているアカウント
SELECT email, locked_at, locked_until, reason
FROM public.account_locks
WHERE locked_until > NOW()
ORDER BY locked_at DESC;

-- レート制限違反が多いIP
SELECT identifier, endpoint, COUNT(*) as request_count
FROM public.rate_limits
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY identifier, endpoint
HAVING COUNT(*) > 50
ORDER BY request_count DESC;

-- ブロックされているIP
SELECT ip_address, reason, blocked_until
FROM public.ip_blocklist
WHERE blocked_until IS NULL OR blocked_until > NOW()
ORDER BY created_at DESC;
```

## トラブルシューティング

### Q: アカウントが誤ってロックされた場合は？

A: Supabase Dashboardから手動でロック解除:

```sql
-- 特定のメールアドレスのロックを解除
DELETE FROM public.account_locks
WHERE email = 'user@example.com';

-- ログイン失敗記録も削除
DELETE FROM public.login_attempts
WHERE email = 'user@example.com' AND success = false;
```

### Q: 特定のIPを緊急でブロックしたい場合は？

A: Supabase Dashboardから手動でブロック:

```sql
-- IPを永久ブロック
INSERT INTO public.ip_blocklist (ip_address, reason, blocked_until)
VALUES ('123.456.789.012', 'Manual block - suspicious activity', NULL);

-- IPを24時間ブロック
INSERT INTO public.ip_blocklist (ip_address, reason, blocked_until)
VALUES ('123.456.789.012', 'Temporary block', NOW() + INTERVAL '24 hours');
```

### Q: レート制限が厳しすぎる場合は？

A: `lib/rate-limit.ts` の `RATE_LIMITS` 設定を調整:

```typescript
const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 10, // 5 → 10に増やす
  },
  // ...
}
```

## 参考リンク

- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
- [Vercel Security](https://vercel.com/docs/security)
