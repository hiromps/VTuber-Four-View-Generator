# 画像履歴機能のセットアップ

このドキュメントでは、画像履歴機能のセットアップ手順を説明します。

## 機能概要

- 生成した画像をSupabase Storageに自動保存
- 画像履歴をデータベースに記録
- 履歴の閲覧と削除機能
- ユーザーごとに個別の履歴管理

## セットアップ手順

### 1. Supabaseマイグレーションの実行

Supabaseダッシュボードで以下のマイグレーションを実行してください：

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. **SQL Editor** に移動
4. `supabase/migrations/20251104095344_create_image_history.sql` の内容を貼り付け
5. **RUN** をクリックして実行

または、Supabase CLIを使用している場合：

```bash
supabase db push
```

### 2. Storage Bucketの確認

マイグレーション実行後、以下を確認してください：

1. **Storage** > **Buckets** に移動
2. `generated-images` という名前のバケットが作成されていることを確認
3. バケットが **Public** に設定されていることを確認

### 3. 動作確認

1. アプリケーションにログイン
2. 画像を生成
3. ヘッダーの「履歴」ボタンをクリック
4. 生成した画像が表示されることを確認

## データベーススキーマ

### image_history テーブル

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（auth.usersへの外部キー） |
| generation_type | TEXT | 生成タイプ（concept/character_sheet/facial_expressions） |
| prompt | TEXT | プロンプト（concept artの場合） |
| aspect_ratio | TEXT | アスペクト比（concept artの場合） |
| additional_prompt | TEXT | 追加指示 |
| images | JSONB | 生成された画像のURL |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### Storage Bucket

- **バケット名**: `generated-images`
- **公開設定**: Public
- **ファイル構造**: `{user_id}/{timestamp}_{filename}`

## RLSポリシー

以下のRLSポリシーが自動的に設定されます：

1. **image_history テーブル**
   - ユーザーは自分の履歴のみ閲覧可能
   - ユーザーは自分の履歴のみ挿入・更新・削除可能

2. **Storage Bucket**
   - ユーザーは自分のフォルダにのみアップロード可能
   - ユーザーは自分のファイルのみ削除可能
   - 全ユーザーが画像を閲覧可能（公開バケット）

## API エンドポイント

### 履歴の取得

```
GET /api/history?limit=20&offset=0
```

**レスポンス:**
```json
{
  "history": [
    {
      "id": "uuid",
      "generation_type": "character_sheet",
      "images": {
        "front": "https://...",
        "back": "https://...",
        "left": "https://...",
        "right": "https://..."
      },
      "created_at": "2024-11-04T10:00:00Z"
    }
  ]
}
```

### 履歴の削除

```
DELETE /api/history/{id}
```

**レスポンス:**
```json
{
  "success": true
}
```

## トラブルシューティング

### 画像がStorageに保存されない

1. Storageバケット `generated-images` が作成されているか確認
2. RLSポリシーが正しく設定されているか確認
3. サーバーログでエラーを確認

### 履歴が表示されない

1. データベースに `image_history` テーブルが作成されているか確認
2. RLSポリシーが正しく設定されているか確認
3. ブラウザのコンソールでエラーを確認

### Storage容量の管理

Supabaseの無料プランでは1GBのStorage容量制限があります。
定期的に不要な履歴を削除することをお勧めします。

## 今後の拡張案

- [ ] 履歴の検索機能
- [ ] 履歴のフィルタリング（タイプ別、日付別）
- [ ] 画像の共有機能
- [ ] 履歴のエクスポート機能
- [ ] Storage容量の使用状況表示
