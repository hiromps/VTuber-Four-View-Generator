# データベースマイグレーション手順

## 問題: Live2Dパーツ生成時の「Failed to consume tokens」エラー

Live2Dパーツやポーズ生成に関連する以下の問題が原因です：

1. **トランザクションタイプの不足**: `transaction_type` ENUMに必要な値が登録されていない
2. **image_history CHECK制約**: `generation_type`が古い値のみを許可している

## 解決方法

以下のいずれかの方法でマイグレーションを適用してください。

### 方法1: Supabase Dashboard から実行（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. 「New query」をクリック
5. 以下のSQLをコピー＆ペーストして実行：

```sql
-- Step 1: Add new transaction types for pose generation and Live2D parts
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'generation_pose';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'generation_live2d_parts';

-- Add refund transaction types
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_sheet';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_expressions';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_pose';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_live2d_parts';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'refund_concept';

-- Step 2: Update image_history generation_type CHECK constraint
ALTER TABLE public.image_history
DROP CONSTRAINT IF EXISTS image_history_generation_type_check;

ALTER TABLE public.image_history
ADD CONSTRAINT image_history_generation_type_check
CHECK (generation_type IN (
    'concept',
    'character_sheet',
    'facial_expressions',
    'pose_generation',
    'live2d_parts'
));
```

6. 「Run」ボタンをクリック
7. 成功メッセージを確認

### 方法2: Supabase CLI から実行

Supabase CLIがインストールされている場合：

```bash
# Supabaseにログイン（まだの場合）
supabase login

# プロジェクトをリンク（まだの場合）
supabase link --project-ref <your-project-ref>

# マイグレーションを適用
supabase db push
```

## 確認方法

マイグレーション適用後、以下のSQLで正しく追加されたか確認できます：

### トランザクションタイプの確認

```sql
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'transaction_type'
ORDER BY enumlabel;
```

以下の12個の値が表示されるはずです：
- free_signup
- generation_concept
- generation_expressions
- generation_live2d_parts
- generation_pose
- generation_sheet
- purchase
- refund_concept
- refund_expressions
- refund_live2d_parts
- refund_pose
- refund_sheet

### image_history CHECK制約の確認

```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.image_history'::regclass
  AND contype = 'c';
```

`generation_type IN ('concept', 'character_sheet', 'facial_expressions', 'pose_generation', 'live2d_parts')` という制約が表示されるはずです。

## トラブルシューティング

### エラー: "type already exists"

すでに一部の値が追加されている場合、このエラーが出る可能性があります。`IF NOT EXISTS` を使用しているため、問題ありません。

### エラー: "permission denied"

データベースの権限が不足している可能性があります。Supabase Dashboardから実行してください。
