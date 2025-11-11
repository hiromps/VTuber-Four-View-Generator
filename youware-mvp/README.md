# VTuber四面図ジェネレーター - Youware MVP版

AI技術を使って、VTuberの立ち絵から四面図（正面・背面・左側面・右側面）を自動生成するWebアプリケーションです。

## 🌟 特徴

- **シンプルな単一HTMLファイル**: 複雑な設定不要、すぐに使える
- **Youware対応**: 10MB未満の軽量設計
- **ドラッグ&ドロップ対応**: 直感的な画像アップロード
- **AI生成**: Google Gemini APIによる高品質な四面図生成
- **レスポンシブデザイン**: スマホ・タブレット・PCで快適に使用可能
- **ローカルストレージ**: データはブラウザに保存され、プライバシー保護

## 📋 必要なもの

1. **Google Gemini APIキー** (無料で取得可能)
   - [Google AI Studio](https://aistudio.google.com/app/apikey)から取得してください

## 🚀 Youwareへのアップロード手順

### 1. ファイルの準備

```bash
# youware-mvpフォルダに移動
cd youware-mvp

# index.htmlファイルを確認
ls
```

### 2. Youwareにアップロード

1. [Youware](https://youware.io/)にアクセス
2. 新しいプロジェクトを作成
3. `index.html`ファイルをアップロード（ドラッグ&ドロップ）
4. デプロイボタンをクリック

### 3. アップロード制限

- **ファイルサイズ制限**: 10MB未満
- **現在のファイルサイズ**: 約15KB（制限内）

## 💡 使い方

### 初回設定

1. アプリを開くと、API設定モーダルが表示されます
2. Google Gemini APIキーを入力して「保存」をクリック
3. APIキーはブラウザのローカルストレージに安全に保存されます

### 四面図の生成

1. **画像をアップロード**
   - 「クリックまたはドラッグ&ドロップ」エリアに立ち絵画像をアップロード
   - 対応形式: PNG、JPEG、WEBP

2. **カスタマイズ（任意）**
   - 追加の指示を入力（例：「眼鏡をかけている」「髪の色を青に」など）
   - 細かい調整が可能です

3. **生成**
   - 「四面図を生成」ボタンをクリック
   - 生成コスト: 4トークン
   - 約1〜2分で4枚の画像が生成されます

4. **ダウンロード**
   - 「全ての画像をダウンロード」ボタンで一括ダウンロード
   - または各画像を個別にダウンロード可能

## 🎮 トークンシステム

- **初期トークン**: 5トークン（無料）
- **生成コスト**: 四面図生成で4トークン消費
- **トークン管理**: ローカルストレージで管理（リセットでトークン回復）

## 🔧 Google Gemini APIキーの取得方法

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. "Create API Key"をクリック
4. 生成されたAPIキーをコピー
5. アプリの「API設定」モーダルに貼り付け

## ⚠️ 重要な注意事項

### ブラウザからの直接API呼び出しについて

**CORS（Cross-Origin Resource Sharing）制限のため、ブラウザから直接Google Gemini APIを呼び出すことには制限があります。**

#### 推奨される解決策

1. **バックエンドサーバーを使用**
   - Next.js、Express、FastAPIなどでバックエンドAPIを作成
   - ブラウザ → バックエンド → Gemini API の流れで通信
   - APIキーをサーバー側で安全に管理

2. **Youwareのサーバーサイド機能を利用**
   - Youware Proプラン以上で利用可能なバックエンド機能を使用
   - サーバーサイドコードでGemini APIを呼び出し

3. **プロキシサーバーを経由**
   - CORS対応のプロキシサーバーを設置
   - ただし、APIキーの露出リスクに注意

#### 現在の実装について

このMVPバージョンは、以下のような構成になっています：

- ✅ **UI/UXの完全実装**: 画像アップロード、トークン管理、レスポンシブデザイン
- ✅ **API統合コードの完全実装**: Gemini 2.5 Flash Image APIの正しい呼び出し方法
- ⚠️ **CORS制限**: ブラウザから直接呼び出す場合、エラーが発生する可能性があります
- ✅ **フォールバック機能**: エラー時にデモモード用のプレースホルダー画像を表示

### API制限について

- Google Gemini APIには使用量制限があります
- 無料プランの場合、1日あたりのリクエスト数に制限があります
- 詳細は[Google AI Studio](https://ai.google.dev/pricing)をご確認ください

### プライバシー

- **APIキー**: ブラウザのローカルストレージに保存され、外部には送信されません
- **画像データ**: Google Gemini APIに送信されますが、Googleのプライバシーポリシーに従って処理されます
- **トークン情報**: ローカルストレージに保存され、サーバーには送信されません

### Youware固有の制限

- **ファイルサイズ**: 10MB未満
- **無料プラン**: 1日5タスクまで
- **プロジェクト数**: 無料プランでは1プロジェクト

## 🔧 本番環境での実装

### オプション1: バックエンドAPIの作成（推奨）

ブラウザ → バックエンド → Gemini API の構成で、CORS制限を回避します。

#### Node.js / Express の例

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate', async (req, res) => {
  try {
    const { base64Image, mimeType, prompt } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt }
        ],
      },
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return res.json({
          imageUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        });
      }
    }

    throw new Error('No image generated');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

#### フロントエンドの変更

`index.html`の`generateSingleView`関数内で、APIエンドポイントを変更：

```javascript
// 変更前
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
    // ...
});

// 変更後（バックエンドサーバーを使用）
const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        base64Image: base64Data,
        mimeType: uploadedImage.mimeType,
        prompt: viewPrompt
    })
});
```

### オプション2: Youwareのサーバーサイド機能を利用

Youware Proプラン以上では、サーバーサイドコードを実行できます。

1. Youwareプロジェクトで`server.js`ファイルを作成
2. 上記のExpressサーバーコードを配置
3. 環境変数で`GEMINI_API_KEY`を設定
4. フロントエンドは同じドメインのAPIエンドポイントを呼び出し

## 🛠️ カスタマイズ

### APIエンドポイントの変更

`index.html`の以下の部分を編集してください：

```javascript
// Gemini APIエンドポイント（ブラウザから直接呼び出す場合）
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
    // ...
});

// またはバックエンドAPIを使用する場合
const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType, prompt: viewPrompt })
});
```

### スタイルのカスタマイズ

`<style>`タグ内のCSSを編集して、デザインをカスタマイズできます：

```css
/* カラーテーマの変更例 */
body {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## 📝 実装の詳細

### 使用技術

- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン、グラデーション、アニメーション
- **Vanilla JavaScript**: フレームワーク不要のシンプルな実装
- **Google Gemini API**: AI画像生成

### 主要な機能

1. **画像アップロード**
   - File API
   - Drag & Drop API
   - FileReader API

2. **ローカルストレージ管理**
   - APIキーの保存
   - トークン管理
   - 設定の永続化

3. **API統合**
   - Fetch API
   - Base64エンコーディング
   - エラーハンドリング

## 🐛 トラブルシューティング

### 画像が生成されない

1. APIキーが正しく設定されているか確認
2. トークンが残っているか確認
3. ブラウザのコンソールでエラーメッセージを確認
4. インターネット接続を確認

### APIエラーが表示される

- APIキーが有効か確認
- API使用量制限に達していないか確認
- [Google AI Studio](https://aistudio.google.com/)で使用状況を確認

### トークンをリセットしたい

ブラウザの開発者ツールを開いて、以下を実行：

```javascript
localStorage.setItem('tokens', '5');
location.reload();
```

## 📞 サポート

問題が発生した場合は、以下をご確認ください：

- [Google Gemini API ドキュメント](https://ai.google.dev/docs)
- [Youware ドキュメント](https://youware.io/docs)

## 📄 ライセンス

MIT License

## 🙏 謝辞

- Google Gemini API
- Youware プラットフォーム
- オープンソースコミュニティ

---

**作成日**: 2025年
**バージョン**: 1.0.0 (MVP)
**対応プラットフォーム**: Youware
