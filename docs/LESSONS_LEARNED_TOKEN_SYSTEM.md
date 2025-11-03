# トークン購入システム実装で学んだ教訓

このドキュメントは、Stripe決済とトークン付与機能の実装で遭遇した問題と解決策をまとめたものです。次回の実装時に同じ問題を避けるためのベストプラクティスを提供します。

## 📋 目次

1. [遭遇した問題の概要](#遭遇した問題の概要)
2. [問題1: Webhookの非同期処理タイミング](#問題1-webhookの非同期処理タイミング)
3. [問題2: データベース制約エラー](#問題2-データベース制約エラー)
4. [問題3: ローカル開発環境の設定](#問題3-ローカル開発環境の設定)
5. [実装チェックリスト](#実装チェックリスト)
6. [ベストプラクティス](#ベストプラクティス)

---

## 遭遇した問題の概要

### 症状
決済が成功し「Payment successful!」メッセージが表示されるが、**トークン残高が増えない**。

### 根本原因
1. **タイミング問題**: Webhookの処理が非同期で、リダイレクト時にはまだ完了していない
2. **データベース制約**: emailカラムのNOT NULL制約違反
3. **設定不備**: 環境変数やWebhookエンドポイントの設定漏れ

---

## 問題1: Webhookの非同期処理タイミング

### 🔴 問題の詳細

**現象:**
```javascript
// ブラウザコンソール
Payment successful! Starting token polling...
[Token Polling] Attempt 1/10
[Token Polling] Current: 1, Initial: 1  // トークンが増えない
[Token Polling] Attempt 2/10
[Token Polling] Current: 1, Initial: 1  // まだ増えない
...
⏱️ [Token Polling] Max attempts reached. Stopping...
```

**原因:**

Stripe決済フローの処理順序：

```
1. ユーザーが決済完了 (t=0秒)
   ↓
2. Stripeが即座にリダイレクト (t=0.5秒)
   ↓ ← ここでユーザーは success ページに到着
3. フロントエンドが初期トークン残高を表示 (t=1秒)
   ↓
4. StripeがWebhookを送信 (t=2秒) ← 非同期処理
   ↓
5. サーバーがトークンをDB追加 (t=3秒)
   ↓
6. DBが更新完了 (t=4秒)
```

**問題:** ステップ3と6の間に**2-3秒のギャップ**があり、ユーザーは古い残高を見てしまう。

### ✅ 解決策：ポーリング機構の実装

フロントエンドで定期的にトークン残高をチェックする：

```typescript
// app/page.tsx
if (success === 'true') {
  setPaymentSuccess(true)

  const initialTokens = tokens
  const maxAttempts = 10
  let attempts = 0

  pollingIntervalId = setInterval(async () => {
    attempts++
    console.log(`[Token Polling] Attempt ${attempts}/${maxAttempts}`)

    try {
      const response = await fetch('/api/tokens')
      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens)

        // トークンが増えたらポーリング停止
        if (data.tokens > initialTokens) {
          console.log('✅ [Token Polling] Tokens updated successfully!')
          if (pollingIntervalId) clearInterval(pollingIntervalId)
        }
      }
    } catch (error) {
      console.error('❌ [Token Polling] Error:', error)
    }

    if (attempts >= maxAttempts) {
      console.warn('⚠️ Webhook may not be configured correctly')
      if (pollingIntervalId) clearInterval(pollingIntervalId)
    }
  }, 3000) // 3秒ごとにチェック
}
```

**ポイント:**
- ✅ 初期残高を保存して比較
- ✅ 3秒間隔でポーリング（サーバー負荷とUXのバランス）
- ✅ 最大試行回数を設定（無限ループ防止）
- ✅ トークン増加を検知したら即停止（効率化）
- ✅ コンポーネントアンマウント時にクリーンアップ

### 📝 次回の実装で意識すること

**❌ やってはいけないこと:**
- リダイレクト直後にトークンが増えていると仮定する
- Webhookが即座に処理されると期待する
- フロントエンドで残高を直接更新する（サーバーが真実の情報源）

**✅ 推奨パターン:**
```typescript
// パターン1: ポーリング（今回採用）
// - シンプルで実装しやすい
// - サーバー側の変更不要
// - 最大30秒待つ

// パターン2: WebSocket / Server-Sent Events
// - リアルタイム更新
// - サーバー側の実装が複雑
// - インフラコスト増

// パターン3: 楽観的UI更新 + バックグラウンド同期
// - UXは最高
// - ロールバック処理が複雑
// - エラーハンドリングが難しい
```

**今回のケースではパターン1（ポーリング）が最適：**
- トークン購入は頻繁に発生しない
- 数秒の遅延は許容範囲
- シンプルで保守しやすい

---

## 問題2: データベース制約エラー

### 🔴 問題の詳細

**エラーログ:**
```
Error upserting user tokens: {
  code: '23502',
  message: 'null value in column "email" of relation "users" violates not-null constraint'
}
POST /api/stripe/webhook 500
```

**原因:**

`users`テーブルのスキーマ：
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,  -- ← NOT NULL制約がある
  tokens INTEGER DEFAULT 100
);
```

`lib/tokens.ts`のupsert処理：
```typescript
// ❌ 問題のコード
await supabase
  .from('users')
  .upsert(
    { id: userId, tokens: newBalance },  // emailが含まれていない
    { onConflict: 'id' }
  )
```

**なぜ問題が発生したか:**
1. 新規ユーザーが決済を完了
2. `auth.users`テーブルにはユーザーが存在（Supabase Auth経由）
3. しかし`users`テーブルにはまだレコードがない
4. Webhookがupsertを試みる
5. emailなしでINSERTしようとして制約違反

### ✅ 解決策1：emailを取得してupsert

```typescript
// ✅ 修正後のコード
export async function addTokens(userId: string, amount: number, stripeSessionId: string) {
  const supabase = createAdminClient()

  // 現在のユーザーデータを取得
  let currentTokens = 0
  let userEmail: string | null = null

  try {
    // usersテーブルから取得
    const { data } = await supabase
      .from('users')
      .select('tokens, email')
      .eq('id', userId)
      .single()

    currentTokens = data?.tokens || 0
    userEmail = data?.email || null
  } catch (error) {
    // usersテーブルに存在しない場合、auth.usersから取得
    const { data: authData } = await supabase.auth.admin.getUserById(userId)
    userEmail = authData?.user?.email || null
    currentTokens = 0
  }

  const newBalance = currentTokens + amount

  // upsertデータにemailを含める
  const upsertData: { id: string; tokens: number; email?: string } = {
    id: userId,
    tokens: newBalance
  }

  if (userEmail) {
    upsertData.email = userEmail
  }

  await supabase
    .from('users')
    .upsert(upsertData, { onConflict: 'id' })

  // 以下、transaction記録など...
}
```

### ✅ 解決策2：スキーマを修正（推奨）

emailカラムをNULL許容にする：

```sql
-- NOT NULL制約を削除
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- または、デフォルト値を設定
ALTER TABLE users ALTER COLUMN email SET DEFAULT '';
```

**どちらを選ぶべきか:**

| アプローチ | メリット | デメリット |
|----------|---------|-----------|
| コードで対応（解決策1） | スキーマ変更不要 | コードが複雑化 |
| スキーマ修正（解決策2） | コードがシンプル | マイグレーション必要 |

**推奨：両方実装**
- スキーマをNULL許容に変更（将来の柔軟性）
- コードでもemailを取得（データの完全性）

### 📝 次回の実装で意識すること

**❌ やってはいけないこと:**
- NOT NULL制約のあるカラムを無視してupsert
- エラーログを見ずに「動かない」と諦める
- テーブルスキーマを確認せずに実装

**✅ 実装前チェックリスト:**
```sql
-- 1. テーブルスキーマを確認
\d users

-- 2. NOT NULL制約を確認
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- 3. upsert対象カラムをすべてリストアップ
-- 4. 必須カラム（NOT NULL）に値を設定できるか確認
-- 5. できない場合は制約を緩和
```

**upsert実装のベストプラクティス:**

```typescript
// ✅ 良い例：必要なデータをすべて取得
const { data: existingUser } = await supabase
  .from('users')
  .select('*')  // 既存データをすべて取得
  .eq('id', userId)
  .single()

const upsertData = {
  ...existingUser,  // 既存データを保持
  tokens: newBalance  // 更新したいフィールドのみ上書き
}

// ❌ 悪い例：部分的なデータのみでupsert
const upsertData = {
  id: userId,
  tokens: newBalance  // 他のNOT NULLカラムが欠落
}
```

---

## 問題3: ローカル開発環境の設定

### 🔴 問題の詳細

**症状:**
- 本番環境では動作するが、ローカル環境でWebhookが動かない
- `localhost:3000`にStripeから直接リクエストが届かない

**原因:**
Stripeは**HTTPS**エンドポイントにのみWebhookを送信。`localhost`はHTTPなので直接受信不可。

### ✅ 解決策：Stripe CLIを使用

**Stripe CLIのインストール:**

```bash
# Mac
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
tar -xvf stripe_*_linux_x86_64.tar.gz
```

**使用方法:**

```bash
# 1. ログイン
stripe login

# 2. Webhookリスナーを起動
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 表示される署名シークレットをコピー
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)

# 3. .env.local に設定
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 4. 開発サーバーを起動（別ターミナル）
npm run dev

# 5. テストイベントを送信（オプション）
stripe trigger checkout.session.completed
```

**Stripe CLIのメリット:**
- ✅ ローカル環境でWebhookをテスト可能
- ✅ リアルタイムでイベントログが見れる
- ✅ テストイベントを手動で送信できる
- ✅ 本番環境へのデプロイ前に検証可能

### 📝 次回の実装で意識すること

**ローカル開発のワークフロー:**

```
1. Stripe CLIをインストール（初回のみ）
   ↓
2. stripe login（初回のみ）
   ↓
3. stripe listen を起動
   ↓
4. 表示された whsec_... を .env.local に設定
   ↓
5. 開発サーバーを起動
   ↓
6. アプリでテスト決済を実行
   ↓
7. stripe listen のターミナルでイベントを確認
   ↓
8. [200] が表示されれば成功
```

**デバッグのコツ:**

Stripe CLIターミナルで確認できること：
```bash
# ✅ 成功例
2024-01-15 12:34:56   --> checkout.session.completed [evt_xxxxx]
2024-01-15 12:34:56   <-- [200] POST http://localhost:3000/api/stripe/webhook

# ❌ 失敗例（署名検証エラー）
2024-01-15 12:34:56   --> checkout.session.completed [evt_xxxxx]
2024-01-15 12:34:56   <-- [400] POST http://localhost:3000/api/stripe/webhook
                           Invalid signature

# ❌ 失敗例（サーバーエラー）
2024-01-15 12:34:56   --> checkout.session.completed [evt_xxxxx]
2024-01-15 12:34:56   <-- [500] POST http://localhost:3000/api/stripe/webhook
                           Error adding tokens
```

---

## 実装チェックリスト

次回Stripe + トークンシステムを実装する際のチェックリスト：

### 設計フェーズ

- [ ] Webhookの非同期処理を考慮したフロー設計
- [ ] データベーススキーマのNOT NULL制約を確認
- [ ] RLS（Row Level Security）ポリシーの設計
- [ ] トランザクションテーブルで履歴を記録する設計

### 実装フェーズ

**バックエンド:**
- [ ] Webhook署名検証の実装
- [ ] admin clientを使用してRLSをバイパス
- [ ] upsert時に必要なカラムをすべて含める
- [ ] トランザクション記録の実装
- [ ] エラーハンドリングとログ出力

**フロントエンド:**
- [ ] ポーリング機構の実装
- [ ] 初期残高の保存と比較
- [ ] 最大試行回数の設定
- [ ] クリーンアップ処理（useEffectのreturn）
- [ ] ユーザーフィードバック（ローディング、成功、エラー）

**環境設定:**
- [ ] `.env.local`にすべての環境変数を設定
- [ ] Vercelにすべての環境変数を設定
- [ ] Stripeダッシュボードでwebhookエンドポイント登録
- [ ] `checkout.session.completed`イベントを選択
- [ ] 署名シークレットをVercelに設定
- [ ] Stripe CLIをローカル開発用にセットアップ

### テストフェーズ

**ローカル環境:**
- [ ] Stripe CLIでWebhookをフォワード
- [ ] テストカード（4242 4242 4242 4242）で決済
- [ ] ブラウザコンソールでポーリングログを確認
- [ ] Stripe CLIで[200]レスポンスを確認
- [ ] データベースでトークン残高を確認
- [ ] transactionsテーブルで履歴を確認

**本番環境:**
- [ ] Stripeダッシュボードでwebhookイベント履歴を確認
- [ ] Vercel関数ログでエラーがないか確認
- [ ] 実際の決済でトークンが増えるか確認
- [ ] エッジケースのテスト（同時決済、キャンセルなど）

---

## ベストプラクティス

### 1. Webhookの実装

**署名検証は必須:**
```typescript
// ✅ 必ず実装
const signature = headers().get('stripe-signature')
if (!signature) {
  return NextResponse.json({ error: 'No signature' }, { status: 400 })
}

try {
  event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
} catch (error) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

**べき等性の確保:**
```typescript
// ✅ 同じイベントが複数回送信されても安全
const { data: existingTransaction } = await supabase
  .from('transactions')
  .select('id')
  .eq('stripe_session_id', stripeSessionId)
  .single()

if (existingTransaction) {
  console.log('Transaction already processed, skipping')
  return NextResponse.json({ received: true })
}

// 処理を続行...
```

### 2. エラーハンドリング

**詳細なログ出力:**
```typescript
// ✅ デバッグしやすいログ
console.log(`Adding tokens: userId=${userId}, amount=${amount}`)
console.log(`Current balance: ${currentTokens}`)
console.log(`New balance: ${newBalance}`)

// ❌ 情報不足のログ
console.log('Adding tokens')
```

**エラーを適切に返す:**
```typescript
// ✅ Stripeに適切なレスポンスを返す
if (!userId || !tokens) {
  console.error('Missing metadata:', session.metadata)
  return NextResponse.json(
    { error: 'Invalid metadata' },
    { status: 400 }  // 400 = 再送しない, 500 = 再送する
  )
}
```

### 3. データベース設計

**トランザクション履歴を必ず記録:**
```typescript
// ✅ すべての操作を記録
await supabase.from('transactions').insert({
  user_id: userId,
  type: 'purchase',
  amount: amount,
  balance_after: newBalance,
  stripe_session_id: stripeSessionId,
  created_at: new Date().toISOString()
})
```

**RLSポリシーを適切に設定:**
```sql
-- ✅ 管理者のみがトークンを追加可能
CREATE POLICY "Only service role can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ✅ ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. フロントエンドのUX

**ローディング状態を表示:**
```typescript
// ✅ ユーザーに処理中であることを伝える
if (paymentSuccess && tokens === initialTokens) {
  return <div>Processing payment... Please wait.</div>
}
```

**タイムアウト後のガイダンス:**
```typescript
// ✅ 問題が発生した場合の指示
if (attempts >= maxAttempts && tokens === initialTokens) {
  return (
    <div>
      Payment processed, but tokens update is delayed.
      Please refresh the page in a few moments.
      If the issue persists, contact support.
    </div>
  )
}
```

### 5. 環境変数管理

**.env.localテンプレートを用意:**
```bash
# .env.example（Gitにコミット可）
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
# ... 他の変数
```

**環境ごとに異なるシークレット:**
```
開発環境: Stripe CLI の whsec_...
本番環境: Stripeダッシュボードの whsec_...
```

---

## まとめ：次回実装時の心構え

### 🎯 重要な3つの原則

1. **非同期を前提に設計する**
   - Webhookは必ず遅延する
   - フロントエンドでポーリングまたはリアルタイム通信
   - ユーザーに適切なフィードバック

2. **データベース制約を事前確認**
   - スキーマのNOT NULL制約をチェック
   - upsert時に必要なデータを全て含める
   - RLSポリシーを確認（admin clientが必要か）

3. **ローカル開発環境を整える**
   - Stripe CLIを使ってWebhookをテスト
   - 本番デプロイ前に完全に検証
   - ログを見てデバッグする習慣

### 📚 参考リソース

- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**最後に:**

今回の実装で学んだ最大の教訓は、**「決済システムは必ず非同期である」**ということです。リダイレクト、Webhook、データベース更新、フロントエンド更新—すべてが異なるタイミングで発生します。

この前提を理解し、適切なポーリングやエラーハンドリングを実装することで、ユーザーに安心して使ってもらえるシステムを構築できます。

次回の実装では、このドキュメントをチェックリストとして活用してください！

---

Made with ❤️ from real implementation experience
