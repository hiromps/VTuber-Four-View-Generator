# Stripe 決済システムセットアップガイド

このガイドでは、VTuber Four-View Generatorのトークン購入機能を有効にするためのStripe設定方法を説明します。

## 前提条件

- Stripeアカウント（無料で作成可能）
- Stripe CLI（ローカル開発用）

## ステップ1: Stripeアカウントの作成

1. [Stripe](https://stripe.com)にアクセス
2. 「Sign up」をクリックしてアカウントを作成
3. メール認証を完了

## ステップ2: テストモードのAPIキーを取得

1. [Stripe Dashboard](https://dashboard.stripe.com)にログイン
2. 右上のスイッチが「Test mode」になっていることを確認
3. 左サイドバーから「Developers」→「API keys」を選択
4. 以下のキーをコピー：
   - **Publishable key** (pk_test_で始まる)
   - **Secret key** (sk_test_で始まる)

## ステップ3: 環境変数の設定

1. プロジェクトルートの `.env.local` ファイルを開く
2. 以下の値を実際のキーに置き換え：

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

3. **重要**: Supabase Service Role Keyの追加
   - [Supabase Dashboard](https://supabase.com/dashboard)にログイン
   - プロジェクトを選択
   - 「Settings」→「API」を開く
   - 「Project API keys」セクションで`service_role`キー（secret）をコピー
   - ⚠️ **警告**: このキーは絶対に公開しないでください
   - `.env.local`に追加：

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...（service_roleキー全体）
```

このキーはWebhook処理でデータベースへの書き込みに必要です。

## ステップ4: Stripe CLIのインストール（ローカル開発用）

### Windows
```powershell
# PowerShellで実行
scoop install stripe
# または
choco install stripe-cli
```

### Mac
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
# Snap経由
sudo snap install stripe

# または直接ダウンロード
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

## ステップ5: Stripe CLIでログイン

```bash
stripe login
```

ブラウザが開くので、アクセスを許可してください。

## ステップ6: Webhookのセットアップ（ローカル開発）

開発サーバーを起動した状態で、新しいターミナルを開いて：

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示された `whsec_` で始まるWebhook signing secretをコピーして、`.env.local`に追加：

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## ステップ7: テスト購入

1. アプリケーションを起動: `npm run dev`
2. ブラウザで http://localhost:3000 を開く
3. サインインして「Buy Tokens」をクリック
4. Stripeのテストカード番号を使用：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）
   - 郵便番号: 任意

## その他のテストカード

- **成功**: 4242 4242 4242 4242
- **認証が必要**: 4000 0025 0000 3155
- **拒否**: 4000 0000 0000 9995

## 本番環境へのデプロイ

1. Stripe Dashboardで「Test mode」を「Live mode」に切り替え
2. 本番用のAPIキーを取得
3. 本番環境の環境変数に設定
4. [Webhookエンドポイント](https://dashboard.stripe.com/webhooks)を作成：
   - URL: `https://your-domain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed` を選択
5. Webhook signing secretを本番環境変数に設定

## トラブルシューティング

### Webhookが動作しない

- Stripe CLIが起動しているか確認
- `.env.local`のWebhook secretが正しいか確認
- 開発サーバーが起動しているか確認

### 決済が完了してもトークンが付与されない

- ブラウザの開発者ツールでネットワークエラーを確認
- サーバーログでエラーメッセージを確認
- Supabaseの接続が正常か確認

### テストモードと本番モードの切り替え

Stripe Dashboardの右上のスイッチで切り替え可能です。**必ずテストモードで十分にテストしてから本番モードに移行してください。**

## サポート

問題が発生した場合：
1. [Stripe Documentation](https://stripe.com/docs)を確認
2. プロジェクトのGitHub Issuesに報告
3. Stripeサポートに問い合わせ
