# Youwareでの環境変数設定ガイド

このガイドでは、YouwareでGEMINI_API_KEYを設定する方法を説明します。

## 🎯 選択肢

Youwareでこのアプリを動かすには、**2つの方法**があります：

### オプションA: HTMLのみ版（簡単・推奨初心者向け）

**現在のindex.htmlをそのまま使用**

- ✅ **メリット**: 設定不要、すぐに使える
- ✅ バックエンド機能不要（無料プランでOK）
- ✅ APIキーはブラウザのローカルストレージで管理
- ⚠️ **デメリット**: CORS制限により、ブラウザから直接Gemini APIを呼び出せない可能性あり

#### 使い方
1. `index.html`をYouwareにアップロード
2. ブラウザでアプリを開く
3. 表示されるモーダルでGemini APIキーを入力
4. APIキーはブラウザに保存されます

### オプションB: バックエンド版（本番環境向け）

**server.jsを使ってバックエンド経由でAPIを呼び出す**

- ✅ **メリット**: CORS制限なし、APIキーをサーバー側で安全に管理
- ✅ 本番環境に適している
- ⚠️ **デメリット**: Youware Pro/Ultraプランが必要（バックエンド機能を使用するため）

---

## 📋 オプションB: バックエンド版のセットアップ手順

### ステップ1: Youwareでプロジェクトを作成

1. [Youware](https://youware.io/)にログイン
2. 新しいプロジェクトを作成
3. **バックエンド機能を有効化**
   - プロジェクト設定で「Backend」または「バックエンド」を有効にする
   - Pro/Ultraプランが必要です

### ステップ2: ファイルをアップロード

以下のファイルをYouwareプロジェクトにアップロードします：

```
youware-mvp/
├── index.html          # フロントエンド
├── server.js           # バックエンドサーバー
├── package.json        # 依存関係
└── .env                # 環境変数（次のステップで作成）
```

### ステップ3: 環境変数を設定

#### 方法1: Youwareの設定画面で設定（推奨）

1. **プロジェクト設定を開く**
   ```
   Youwareダッシュボード
   → あなたのプロジェクト
   → 設定アイコン（⚙️）または「Settings」
   ```

2. **環境変数セクションを探す**

   以下のような名前のセクションを探してください：
   - 「Environment Variables」
   - 「環境変数」
   - 「Secrets」
   - 「Config Variables」
   - 「Project Settings」内の「Variables」

3. **APIキーを追加**
   ```
   Key (キー):   GEMINI_API_KEY
   Value (値):   あなたのGemini APIキー
   ```

4. **保存**ボタンをクリック

#### 方法2: .envファイルをアップロード

もし設定画面が見つからない場合は、`.env`ファイルを作成してアップロードします：

1. **ローカルで.envファイルを作成**

   `.env.example`ファイルをコピーして`.env`にリネーム：
   ```bash
   # Windowsの場合
   copy .env.example .env

   # Mac/Linuxの場合
   cp .env.example .env
   ```

2. **.envファイルを編集**
   ```
   GEMINI_API_KEY=あなたの実際のAPIキー
   ```

3. **Youwareにアップロード**
   - `.env`ファイルをプロジェクトのルートディレクトリにアップロード
   - ⚠️ 注意: `.env`ファイルは公開されないよう設定してください

### ステップ4: 依存パッケージをインストール

Youwareは通常、`package.json`を検出すると自動的にパッケージをインストールします。

もし手動でインストールが必要な場合：
```bash
npm install
```

### ステップ5: サーバーを起動

Youwareでバックエンドが有効な場合、以下のコマンドでサーバーが起動されます：
```bash
npm start
```

または、Youwareが自動的に`server.js`を検出して起動します。

### ステップ6: フロントエンドを修正（重要）

`index.html`内の`generateSingleView`関数を修正して、バックエンドAPIを呼び出すようにします：

**修正箇所（行番号: 約698行目）:**

```javascript
// ❌ 変更前（ブラウザから直接Gemini APIを呼び出す）
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        // ...
    })
});

// ✅ 変更後（バックエンドAPIを呼び出す）
const response = await fetch('/api/generate-view', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        base64Image: base64Data,
        mimeType: uploadedImage.mimeType,
        view: view,
        additionalPrompt: additionalPrompt
    })
});
```

**APIキー入力モーダルを削除（オプション）:**

バックエンド版では、APIキーはサーバー側で管理されるため、ブラウザでのAPIキー入力は不要です。
必要に応じて、APIキー設定モーダルを削除またはコメントアウトしてください。

---

## 🔍 環境変数設定の確認方法

### サーバーログを確認

1. Youwareのプロジェクトダッシュボードで「Logs」または「ログ」を開く
2. 以下のメッセージが表示されれば成功：
   ```
   ✅ Gemini API initialized
   🚀 Server running on port 3000
   ```

3. エラーメッセージが表示される場合：
   ```
   ❌ GEMINI_API_KEY が設定されていません
   ```
   → 環境変数の設定を再確認してください

### ヘルスチェックAPIをテスト

ブラウザで以下のURLにアクセス：
```
https://your-project.youware.io/api/health
```

成功すると以下のレスポンスが返ります：
```json
{
  "status": "ok",
  "message": "VTuber Four-View Generator API is running",
  "timestamp": "2025-11-05T15:00:00.000Z"
}
```

---

## 🆘 トラブルシューティング

### 問題1: 環境変数の設定画面が見つからない

**解決策:**
1. Youwareのドキュメントを確認：[https://youware.io/docs](https://youware.io/docs)
2. サポートに問い合わせる
3. `.env`ファイルをアップロードする方法を試す

### 問題2: "GEMINI_API_KEY is required" エラー

**原因:** 環境変数が正しく設定されていません

**解決策:**
1. 環境変数名のスペルを確認：`GEMINI_API_KEY`（すべて大文字）
2. APIキーの値に余分なスペースや改行がないか確認
3. プロジェクトを再起動してみる

### 問題3: CORS エラーが出る

**原因:** フロントエンドが直接Gemini APIを呼び出そうとしている

**解決策:**
1. `index.html`の`generateSingleView`関数を修正（上記ステップ6参照）
2. バックエンド経由でAPIを呼び出すようにする

### 問題4: バックエンド機能が有効にできない

**原因:** 無料プランではバックエンド機能に制限があります

**解決策:**
1. Youware Pro/Ultraプランにアップグレード
2. または、オプションA（HTMLのみ版）を使用する

---

## 📚 参考情報

### Google Gemini APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. "Create API Key"をクリック
4. 生成されたAPIキーをコピー

### Youware関連リンク

- 公式サイト: https://youware.io/
- ドキュメント: https://youware.io/docs（存在する場合）
- サポート: プラットフォーム内のヘルプセンター

### 料金プラン

- **無料プラン**: バックエンド機能は1プロジェクトまで、1日5タスクまで
- **Proプラン**: バックエンド機能4プロジェクトまで
- **Ultraプラン**: バックエンド機能250プロジェクトまで

---

## 💡 おすすめの使い方

### 開発・テスト段階
- **オプションA（HTMLのみ版）**を使用
- ローカルでテストして動作確認
- デモやプロトタイプに最適

### 本番環境
- **オプションB（バックエンド版）**を使用
- 環境変数でAPIキーを安全に管理
- CORS制限を回避して安定した動作

---

## 📝 まとめ

| 項目 | HTMLのみ版 | バックエンド版 |
|------|-----------|--------------|
| 設定の難易度 | ⭐ 簡単 | ⭐⭐⭐ やや難しい |
| 必要なプラン | 無料プランでOK | Pro/Ultra必要 |
| CORS制限 | あり（問題になる可能性） | なし |
| セキュリティ | ⚠️ APIキーがブラウザに露出 | ✅ サーバー側で管理 |
| 推奨用途 | 個人使用、デモ | 本番環境 |

**初めて試す場合は「HTMLのみ版」から始めることをおすすめします！**

---

ご不明な点があれば、お気軽にお問い合わせください 🙌
