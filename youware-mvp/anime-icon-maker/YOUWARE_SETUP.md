# Youware セットアップガイド

Shonen Icon MakerをYouwareにデプロイする完全ガイド

## 🎯 概要

このガイドでは、Shonen Icon MakerをYouwareにデプロイして、誰でもアクセスできるWebアプリとして公開する方法を説明します。

## 📋 必要なもの

### Youwareプラン

- **推奨**: Pro または Ultra プラン
- **理由**: バックエンド機能（Node.js サーバー）が必要
- 無料プランではバックエンドに制限があります

### APIキー

- Google AI Studio APIキー（無料で取得可能）
- 取得方法: https://aistudio.google.com/app/apikey

## 🚀 デプロイ手順

### ステップ1: Youwareプロジェクトを作成

1. [Youware](https://youware.io/)にログイン
2. 「New Project」をクリック
3. プロジェクト名: `shonen-icon-maker`（任意）
4. **バックエンド機能を有効化**
   - 設定で「Backend」または「バックエンド」を有効にする

### ステップ2: ファイルをアップロード

以下のファイルをYouwareプロジェクトにアップロード：

```
shonen-icon-maker/
├── index.html          ← アップロード
├── server.js           ← アップロード
├── package.json        ← アップロード
└── .env                ← 次のステップで作成
```

**アップロード方法**:
- Youwareのファイルマネージャーを使用
- または、GitHubリポジトリから連携

### ステップ3: 環境変数を設定

#### 方法1: Youware設定画面（推奨）

1. プロジェクト設定を開く
   ```
   Youwareダッシュボード
   → プロジェクト
   → 設定アイコン（⚙️）
   ```

2. 環境変数セクションを探す
   - 「Environment Variables」
   - 「環境変数」
   - 「Secrets」

3. APIキーを追加
   ```
   Key (キー):   GEMINI_API_KEY
   Value (値):   [あなたのGoogle AI Studio APIキー]
   ```

4. 保存

#### 方法2: .envファイルをアップロード

1. `.env.example`をコピーして`.env`にリネーム
   ```bash
   cp .env.example .env
   ```

2. `.env`ファイルを編集
   ```
   GEMINI_API_KEY=あなたの実際のAPIキー
   PORT=3000
   ```

3. Youwareにアップロード

### ステップ4: 依存パッケージのインストール

Youwareは通常、`package.json`を検出すると自動的にパッケージをインストールします。

**手動でインストールが必要な場合**:
1. Youwareのターミナルを開く
2. 以下のコマンドを実行
   ```bash
   npm install
   ```

### ステップ5: サーバーを起動

Youwareは通常、`package.json`の`start`スクリプトを自動実行します。

**手動起動が必要な場合**:
```bash
npm start
```

### ステップ6: 動作確認

1. Youwareが提供するURLにアクセス
   - 例: `https://shonen-icon-maker.youware.io`

2. ヘルスチェック
   ```
   https://your-project.youware.io/api/health
   ```

   成功レスポンス:
   ```json
   {
     "status": "ok",
     "message": "Shonen Icon Maker API is running",
     "timestamp": "2025-11-06T..."
   }
   ```

3. アイコン生成テスト
   - トップページを開く
   - プリセット例を試す
   - 画像が生成されればOK！

## 🔍 トラブルシューティング

### 問題1: 環境変数エラー

```
❌ GEMINI_API_KEY が設定されていません
```

**解決方法**:
1. 環境変数名のスペルを確認：`GEMINI_API_KEY`（すべて大文字）
2. APIキーの値に余分なスペースや改行がないか確認
3. プロジェクトを再起動

### 問題2: パッケージインストールエラー

```
Error: Cannot find module '@google/genai'
```

**解決方法**:
1. Youwareのターミナルで`npm install`を実行
2. `package.json`が正しくアップロードされているか確認
3. Node.jsバージョンを確認（18.0.0以上）

### 問題3: 画像生成エラー

```
Failed to generate icon
```

**解決方法**:
1. APIキーが有効か確認（Google AI Studioで確認）
2. APIの使用制限に達していないか確認
3. プロンプトを変更してみる
4. Youwareのログを確認

### 問題4: CORSエラー

```
Access to fetch blocked by CORS policy
```

**解決方法**:
- `server.js`でCORSが有効になっているか確認
- 既に実装済み（`app.use(cors())`）
- それでもエラーが出る場合は、Youwareのサポートに問い合わせ

## 📊 ログの確認方法

1. Youwareダッシュボードを開く
2. プロジェクトを選択
3. 「Logs」または「ログ」タブを開く

**成功時のログ例**:
```
✅ Gemini API initialized
🚀 Shonen Icon Maker Server running on port 3000
   Health check: http://localhost:3000/api/health
   Generate icon: POST http://localhost:3000/api/generate-icon
   Styles list: GET http://localhost:3000/api/styles

⚡ Ready to generate awesome anime icons!
```

## 🎨 カスタマイズ

### ドメイン設定（Pro/Ultraプラン）

1. Youware設定で「Custom Domain」を開く
2. 独自ドメインを追加
   - 例: `icon.yoursite.com`
3. DNS設定を更新
4. SSL証明書を自動取得

### アプリ名の変更

`index.html`の以下を編集：

```html
<title>あなたのアプリ名</title>
<h1>⚡ あなたのアプリ名</h1>
```

### カラースキームの変更

`index.html`の`<style>`セクションで`.anime-gradient`を編集：

```css
.anime-gradient {
    background: linear-gradient(135deg, #あなたの色1 0%, #あなたの色2 100%);
}
```

## 💰 料金について

### Youware料金

- **無料プラン**: バックエンド機能は1プロジェクトまで、1日5タスクまで
- **Proプラン**: バックエンド機能4プロジェクトまで
- **Ultraプラン**: バックエンド機能250プロジェクトまで

詳細: https://youware.io/pricing

### nano-banana API料金

- **画像生成**: $0.039/画像（約25枚/$1）
- **無料枠**: Google AI Studioの無料枠内で使用可能

詳細: https://ai.google.dev/pricing

## 🚀 次のステップ

### 1. パフォーマンス最適化

- 画像キャッシュの実装
- レート制限の追加
- エラーログの収集

### 2. 機能追加

- 生成履歴の保存（localStorage）
- ユーザー設定の保存
- お気に入り機能
- 画像編集機能

### 3. マーケティング

- Twitter/X で告知
- Product Hunt に投稿
- Reddit の関連サブレディットで紹介
- YouTube でデモ動画作成

## 📝 チェックリスト

デプロイ前:
- [ ] `package.json`が正しい
- [ ] `server.js`が動作する（ローカルテスト）
- [ ] `.env.example`が含まれている
- [ ] APIキーを取得済み

デプロイ後:
- [ ] 環境変数が設定されている
- [ ] ヘルスチェックが成功する
- [ ] 画像生成テストが成功する
- [ ] モバイルで表示確認
- [ ] エラーログを確認

公開前:
- [ ] README.mdを更新
- [ ] プライバシーポリシーを追加（オプション）
- [ ] 利用規約を追加（オプション）
- [ ] OGP画像を設定（SNSシェア用）

## 🔗 参考リンク

- [Youware公式サイト](https://youware.io/)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [nano-banana Tutorial](https://dev.to/googleai/how-to-build-with-nano-banana-complete-developer-tutorial-646)

## 💡 成功事例

Youwareで公開された類似プロジェクト:
- VTuber四面図ジェネレーター
- AIロゴメーカー
- プロフィール画像ジェネレーター

## 🆘 サポート

問題が発生した場合:
1. このガイドのトラブルシューティングを確認
2. Youwareのドキュメントを確認
3. Youwareサポートに問い合わせ
4. GitHubのIssuesに報告（該当する場合）

---

**⚡ Youwareでのデプロイ、頑張ってください！**

何か問題があれば、遠慮なくサポートに連絡してください 🙌
