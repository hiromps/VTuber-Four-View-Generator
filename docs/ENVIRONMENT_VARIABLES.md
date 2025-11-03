# 環境変数設定ガイド

VTuber Four-View Generatorの動作に必要な環境変数の設定方法を説明します。

## 📋 必要な環境変数一覧

### Stripe（決済）

```env
# Stripe公開キー（フロントエンド用）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx...

# Stripeシークレットキー（サーバーサイド用）
STRIPE_SECRET_KEY=sk_test_xxxxx...

# Stripe Webhook署名シークレット
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

### Supabase（データベース・認証）

```env
# Supabase URL（フロントエンド用）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase匿名キー（フロントエンド用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Supabaseサービスロールキー（管理者権限、サーバーサイド用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Google Gemini API（画像生成）

```env
# Google Gemini APIキー
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

### アプリケーション設定

```env
# アプリケーションのベースURL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🔧 設定方法

### ローカル開発環境

1. プロジェクトルートに `.env.local` ファイルを作成
2. 以下のテンプレートをコピーして値を設定

**.env.local テンプレート:**

```env
# ============================================
# Stripe - テストモード
# ============================================
# ダッシュボード: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx...
STRIPE_SECRET_KEY=sk_test_xxxxx...

# Webhookシークレット（Stripe CLIまたはStripeダッシュボードから取得）
# Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook
# ダッシュボード: https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# ============================================
# Supabase
# ============================================
# ダッシュボード: https://app.supabase.com/ > プロジェクト > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# サービスロールキー（admin権限、絶対に公開しないこと）
# Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ============================================
# Google Gemini API
# ============================================
# Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=AIzaSy...

# ============================================
# アプリケーション
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **重要:** `.env.local` が `.gitignore` に含まれていることを確認

```bash
# .gitignore に追加されているか確認
grep ".env.local" .gitignore
```

### 本番環境（Vercel）

#### 方法1: Vercelダッシュボード（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. **Settings** > **Environment Variables** に移動
4. 各環境変数を追加:

**追加する環境変数:**

| 変数名 | 環境 | 値 |
|--------|------|-----|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production, Preview, Development | `pk_live_...` (本番) / `pk_test_...` (テスト) |
| `STRIPE_SECRET_KEY` | Production, Preview, Development | `sk_live_...` (本番) / `sk_test_...` (テスト) |
| `STRIPE_WEBHOOK_SECRET` | Production | `whsec_...` (本番Webhook用) |
| `STRIPE_WEBHOOK_SECRET` | Preview, Development | `whsec_...` (テストWebhook用) |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development | `eyJhbGc...` |
| `GOOGLE_GEMINI_API_KEY` | Production, Preview, Development | `AIzaSy...` |
| `NEXT_PUBLIC_APP_URL` | Production | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Preview, Development | `https://your-app-preview.vercel.app` |

5. **Save** をクリック
6. **プロジェクトを再デプロイ** (環境変数変更後は必須)

#### 方法2: Vercel CLI

```bash
# ログイン
vercel login

# 環境変数を設定（本番環境）
vercel env add STRIPE_SECRET_KEY production
# プロンプトで値を入力

# 環境変数を設定（プレビュー環境）
vercel env add STRIPE_WEBHOOK_SECRET preview

# 環境変数を一覧表示
vercel env ls

# プロジェクトを再デプロイ
vercel --prod
```

---

## 🔐 各環境変数の取得方法

### Stripe

#### 1. APIキー（STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY）

1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. **開発者** > **APIキー** に移動
3. テストモード/本番モードを切り替え
4. キーをコピー

**テストモード:**
- 公開キー: `pk_test_...`
- シークレットキー: `sk_test_...`

**本番モード:**
- 公開キー: `pk_live_...`
- シークレットキー: `sk_live_...`

#### 2. Webhook署名シークレット（STRIPE_WEBHOOK_SECRET）

**Stripeダッシュボードから:**
1. **開発者** > **Webhooks** に移動
2. エンドポイントを選択（なければ作成）
3. **署名シークレットを表示** をクリック
4. `whsec_...` をコピー

**Stripe CLIから（ローカル開発）:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
表示される `whsec_...` をコピー

詳細: [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)

### Supabase

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. **Settings** > **API** に移動
4. 以下をコピー:
   - **URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **公開厳禁**

### Google Gemini API

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. **Create API key** をクリック
3. Google Cloudプロジェクトを選択または作成
4. 生成されたAPIキーをコピー

---

## ✅ 設定確認チェックリスト

### ローカル開発環境

```bash
# .env.localファイルが存在するか確認
ls -la .env.local

# 環境変数が読み込まれているか確認（開発サーバー起動時）
npm run dev
```

ブラウザのコンソールで確認:
```javascript
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
// "pk_test_..." が表示されればOK
```

### 本番環境（Vercel）

1. Vercel Dashboard > プロジェクト > **Settings** > **Environment Variables**
2. すべての必須変数が設定されているか確認

#### 必須変数チェックリスト

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GOOGLE_GEMINI_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

---

## 🚨 セキュリティ注意事項

### 絶対に公開してはいけない変数

❌ **公開厳禁:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GEMINI_API_KEY`

これらは**管理者権限**を持ちます。公開すると：
- データベースの全データにアクセス可能
- 決済情報の操作が可能
- AIリソースの不正利用

### 安全に管理する方法

✅ **推奨:**
1. **環境変数として設定** - コードに直接書かない
2. **`.env.local`を`.gitignore`に追加** - Gitにコミットしない
3. **本番環境はVercelの環境変数を使用** - コードとは別管理
4. **定期的にキーをローテーション** - 漏洩時のリスク軽減
5. **最小権限の原則** - 必要な権限のみ付与

### .gitignore 確認

`.gitignore` に以下が含まれているか確認:

```gitignore
# 環境変数
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel
```

---

## 🔧 トラブルシューティング

### 問題: 環境変数が読み込まれない

**ローカル開発:**
1. ファイル名が `.env.local` であることを確認（`.env` ではない）
2. Next.jsの開発サーバーを再起動
   ```bash
   # Ctrl+C で停止
   npm run dev
   ```
3. `NEXT_PUBLIC_` プレフィックスがフロントエンド用変数に付いているか確認

**Vercel:**
1. 環境変数を設定後、プロジェクトを再デプロイ
2. 正しい環境（Production/Preview/Development）に設定されているか確認
3. Vercel CLI で確認:
   ```bash
   vercel env pull .env.local
   ```

### 問題: "Invalid API key" エラー

**原因:**
- APIキーが間違っている
- テストモード/本番モードの不一致
- キーの有効期限切れ

**解決策:**
1. ダッシュボードでキーを再確認
2. テストモード用キーには `_test_`、本番用には `_live_` が含まれることを確認
3. 必要に応じて新しいキーを生成

### 問題: Webhookが動作しない

**確認項目:**
1. `STRIPE_WEBHOOK_SECRET` が正しく設定されているか
2. テスト/本番環境で正しいシークレットを使用しているか
3. Vercelで環境変数設定後、再デプロイしたか

詳細: [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)

---

## 📚 関連ドキュメント

- [Stripe Webhook 設定ガイド](./STRIPE_WEBHOOK_SETUP.md)
- [Supabase Email Template 設定ガイド](../supabase/EMAIL_TEMPLATE_SETUP.md)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

Made with ❤️ for VTuber creators
