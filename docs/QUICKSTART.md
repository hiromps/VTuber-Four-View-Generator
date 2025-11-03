# VTuber Four-View Generator - クイックスタートガイド

このガイドでは、VTuber Four-View Generatorを最短でセットアップして動作させる方法を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [セットアップ（5分）](#セットアップ5分)
3. [Stripe Webhook設定（5分）](#stripe-webhook設定5分)
4. [デプロイ（3分）](#デプロイ3分)
5. [動作確認](#動作確認)

---

## 前提条件

以下のアカウントを事前に作成してください：

- ✅ [GitHub](https://github.com/) アカウント
- ✅ [Vercel](https://vercel.com/) アカウント
- ✅ [Supabase](https://supabase.com/) アカウント
- ✅ [Stripe](https://stripe.com/) アカウント（テストモード）
- ✅ [Google AI Studio](https://aistudio.google.com/) アカウント

---

## セットアップ（5分）

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/VTuber-Four-View-Generator.git
cd VTuber-Four-View-Generator
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.local` ファイルを作成:

```bash
cp .env.example .env.local
# または
touch .env.local
```

`.env.local` を編集して以下を設定:

```env
# Stripe（テストモード）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # 後で設定

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google Gemini
GOOGLE_GEMINI_API_KEY=AIzaSy...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**各APIキーの取得方法:** [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

### 4. Supabaseデータベースをセットアップ

Supabase SQLエディタで以下を実行:

```sql
-- usersテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  tokens INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- transactionsテーブル
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'purchase', 'usage', 'refund'
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### 5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く

---

## Stripe Webhook設定（5分）

トークン購入機能を動作させるには、Stripe Webhookの設定が必要です。

### ローカル開発の場合

#### オプション1: Stripe CLI（推奨）

1. **Stripe CLIをインストール:**

   **Mac:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

   **Windows:**
   ```bash
   scoop install stripe
   ```

2. **Stripeにログイン:**
   ```bash
   stripe login
   ```

3. **Webhookリスナーを起動:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **表示された `whsec_...` をコピー** して `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定

5. **開発サーバーを再起動:**
   ```bash
   npm run dev
   ```

#### オプション2: ngrok

1. **ngrokをインストール:**
   ```bash
   npm install -g ngrok
   ```

2. **ngrokを起動:**
   ```bash
   ngrok http 3000
   ```

3. **表示されたHTTPS URL**（例: `https://abc123.ngrok.io`）をコピー

4. **Stripeダッシュボード**で設定（次のセクション参照）

### 本番環境の場合

**詳細な手順:** [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)

**要約:**

1. [Stripe Dashboard](https://dashboard.stripe.com/) > **開発者** > **Webhooks**
2. **エンドポイントを追加**
3. エンドポイントURL: `https://your-app.vercel.app/api/stripe/webhook`
4. リッスンするイベント: `checkout.session.completed`
5. **署名シークレット** (`whsec_...`) をコピー
6. Vercelの環境変数 `STRIPE_WEBHOOK_SECRET` に設定

---

## デプロイ（3分）

### Vercelへのデプロイ

1. **GitHubにプッシュ:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Vercelにインポート:**
   - [Vercel Dashboard](https://vercel.com/new) にアクセス
   - **Import Git Repository** をクリック
   - GitHubリポジトリを選択
   - **Deploy** をクリック

3. **環境変数を設定:**
   - Vercel Dashboard > プロジェクト > **Settings** > **Environment Variables**
   - `.env.local` の内容をすべて追加（`Production` にチェック）
   - **Save**

4. **再デプロイ:**
   - **Deployments** タブ > 最新デプロイメント > `...` > **Redeploy**

5. **Stripe Webhookを設定:**
   - デプロイ完了後のURL（例: `https://your-app.vercel.app`）を取得
   - Stripeダッシュボードで webhook エンドポイントを追加:
     ```
     https://your-app.vercel.app/api/stripe/webhook
     ```
   - 署名シークレットをVercelの環境変数 `STRIPE_WEBHOOK_SECRET` に設定
   - 再度デプロイ

---

## 動作確認

### 1. アカウント登録

1. アプリを開く
2. **Sign Up** をクリック
3. メールアドレスとパスワードを入力
4. Supabaseから確認メールが届く
5. メール内のリンクをクリックして確認

### 2. トークン購入テスト

1. ログイン後、**Buy Tokens** をクリック
2. 任意のトークンパッケージを選択
3. Stripe チェックアウトページで以下を入力:
   - **カード番号**: `4242 4242 4242 4242`
   - **有効期限**: 任意の未来日付（例: `12/25`）
   - **CVC**: 任意の3桁（例: `123`）
4. **支払う** をクリック

**期待される動作:**
- ✅ 「Payment successful!」メッセージが表示される
- ✅ 2-5秒後にトークン残高が増加する
- ✅ ブラウザコンソールに成功ログが表示される

**コンソールログ例:**
```
Payment successful! Starting token polling...
[Token Polling] Attempt 1/10
[Token Polling] Attempt 2/10
✅ [Token Polling] Tokens updated successfully!
```

### 3. VTuber生成テスト

1. トークンがあることを確認
2. **Generate VTuber** セクションで設定:
   - キャラクター名
   - キャラクター説明
   - スタイル（Anime, Realistic, Chibi など）
3. **Generate** をクリック
4. 生成完了を待つ（約30秒）
5. 4枚の画像が表示される

---

## トラブルシューティング

### トークンが増えない

**原因:**
- Stripe Webhookが設定されていない
- 環境変数 `STRIPE_WEBHOOK_SECRET` が間違っている

**解決策:**
1. [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md) の手順に従って設定
2. Vercelで環境変数を確認
3. Stripeダッシュボード > Webhooks > イベント履歴を確認

### 画像が生成されない

**原因:**
- Google Gemini APIキーが間違っている
- APIクォータを超過している

**解決策:**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキーを確認
2. APIクォータを確認
3. `.env.local` の `GOOGLE_GEMINI_API_KEY` を更新して再起動

### ログインできない

**原因:**
- Supabaseメール確認が完了していない
- Supabase設定が間違っている

**解決策:**
1. メール受信トレイを確認（迷惑メールフォルダも）
2. Supabaseダッシュボード > Authentication > Users で確認
3. Supabase環境変数を確認

---

## 次のステップ

### カスタマイズ

- **トークンパッケージ**: `lib/stripe.ts` で価格とトークン数を調整
- **スタイルオプション**: `app/page.tsx` でスタイルを追加
- **メールテンプレート**: [supabase/EMAIL_TEMPLATE_SETUP.md](../supabase/EMAIL_TEMPLATE_SETUP.md)

### 本番環境へ移行

1. **Stripeを本番モードに切り替え:**
   - Stripeダッシュボード > 本番モードに切り替え
   - 本番用APIキーを取得
   - Vercel環境変数を更新（`pk_live_...`, `sk_live_...`）

2. **独自ドメインを設定:**
   - Vercel Dashboard > プロジェクト > **Settings** > **Domains**
   - カスタムドメインを追加

3. **Supabaseプランをアップグレード:**
   - 無料プランには制限があります
   - 本番運用にはProプランを推奨

---

## 📚 詳細ドキュメント

- [環境変数設定ガイド](./ENVIRONMENT_VARIABLES.md)
- [Stripe Webhook設定ガイド](./STRIPE_WEBHOOK_SETUP.md)
- [Supabase メールテンプレート設定](../supabase/EMAIL_TEMPLATE_SETUP.md)

---

## サポート

質問や問題がある場合:
- GitHub Issues: [プロジェクトのIssues](https://github.com/your-username/VTuber-Four-View-Generator/issues)
- Discord: [コミュニティサーバー](https://discord.gg/xxxxx)

---

Made with ❤️ for VTuber creators
