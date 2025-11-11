# 💖 VTuber Icon Maker

可愛いVTuber風プロフィールアイコンをAIで生成

![VTuber Icon Maker](https://img.shields.io/badge/Powered%20by-Youware%20AI%20SDK-pink?style=for-the-badge)
![nano-banana](https://img.shields.io/badge/Model-nano--banana-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ 特徴

### 🎨 6つのVTuberタイプ

1. **🐱 猫耳** - かわいい猫耳、猫のような仕草
2. **🦊 狐耳** - ふわふわの狐耳としっぽ、神秘的な雰囲気
3. **🦈 サメ (Gawr Gura風)** - サメフード、尖った歯、青いテーマ
4. **🐰 うさ耳** - 長いうさぎ耳、ふわふわしっぽ、元気な雰囲気
5. **😈 悪魔角** - 小さな悪魔の角、いたずらっぽい表情
6. **😇 天使の輪** - 天使の輪と羽、清純な雰囲気

### 🎮 4つの配信スタイル

- **ゲーマー**: ヘッドフォン、ゲームコントローラー、ゲーミングセットアップ
- **配信者**: ストリーミングマイク、PCモニター、配信環境
- **アイドル**: アイドル衣装、ステージ背景、キラキラエフェクト
- **カジュアル**: 普段着、リラックスした雰囲気

### 💕 5つの雰囲気

- **可愛い (Kawaii)**: パステルカラー、ハートエフェクト、甘い雰囲気
- **クール**: スタイリッシュ、自信に満ちた表情、モダンな美学
- **元気**: 明るい笑顔、鮮やかな色、ダイナミックなポーズ
- **神秘的**: 謎めいた微笑み、ダークカラー、魅惑的なオーラ
- **明るい**: 大きな笑顔、暖かい色、ポジティブなエネルギー

## 🚀 Youware AI SDK統合

### 🌟 最大の特徴

**環境変数の設定が不要！**

このプロジェクトは **Youware AI SDK** を使用しており、トークンは **Youware経由で自動消費** されます。

従来の方法：
```bash
# ❌ 従来: Google AI Studio APIキーが必要
GEMINI_API_KEY=your_api_key_here
```

Youware AI SDK：
```bash
# ✅ Youware: 環境変数の設定不要！
# Youwareが自動的にAPIキーを管理
# トークンも自動消費
```

### 📊 Youware AI SDKのメリット

| 項目 | 従来の方法 | Youware AI SDK |
|------|-----------|---------------|
| APIキー設定 | 必要 | **不要** ✨ |
| トークン管理 | 手動 | **自動** ✨ |
| 請求管理 | 別途必要 | **Youware一元管理** ✨ |
| セキュリティ | APIキー露出リスク | **安全** ✨ |
| デプロイ | 複雑 | **超簡単** ✨ |

## 🎯 クイックスタート

### Youwareにデプロイ（推奨）

#### ステップ1: Youwareプロジェクト作成

1. [Youware](https://youware.io/)にログイン
2. 「New Project」をクリック
3. プロジェクト名: `vtuber-icon-maker`

#### ステップ2: AI App MCPを有効化

1. プロジェクト設定を開く
2. 「AI App MCP」を有効化
3. 「use nano-banana API」にチェック

#### ステップ3: ファイルをアップロード

以下のファイルをアップロード：
```
vtuber-icon-maker/
├── index.html
├── server.js
└── package.json
```

#### ステップ4: デプロイ

Youwareが自動的に：
- 依存パッケージをインストール
- サーバーを起動
- nano-banana APIを統合
- トークン管理を設定

**完成！** 環境変数の設定は一切不要です 🎉

### ローカルで試す（制限あり）

```bash
# 依存パッケージをインストール
npm install

# サーバー起動
npm start

# ブラウザで開く
http://localhost:3000
```

⚠️ **注意**: ローカル環境では画像生成は動作しません。
Youware AI SDKが必要です。UIのプレビューのみ可能。

## 💻 使い方

### 基本的な使い方

1. **キャラクターの特徴を入力**
   ```
   例: ピンクの髪、大きな青い瞳、猫耳、ヘッドフォン、笑顔、可愛い
   ```

2. **VTuberタイプを選択**
   - 🐱 猫耳、🦊 狐耳、🦈 サメ、等

3. **配信スタイルを選択**
   - 🎮 ゲーマー、🎤 配信者、🎵 アイドル、😊 カジュアル

4. **雰囲気を選択**
   - 💗 可愛い、😎 クール、⚡ 元気、等

5. **生成ボタンをクリック**
   - 5-10秒で完成！

### プリセット例

4つのプリセットが用意されています：

- **🐱 かわいい猫耳ゲーマー**
- **🦊 狐耳配信者**
- **🦈 サメちゃん (Gura風)**
- **🎵 アイドルVTuber**

## 🎨 技術仕様

### フロントエンド

- **HTML5** + **Tailwind CSS**
- Vanilla JavaScript
- レスポンシブデザイン
- 可愛いアニメーション・エフェクト
- M PLUS Rounded 1c フォント

### バックエンド

- **Node.js** + **Express**
- **Youware AI SDK** 統合
- **nano-banana API** (Gemini 2.5 Flash Image)
- 環境変数不要の設計

### AI機能

- **モデル**: `gemini-2.5-flash-image` (nano-banana)
- **出力サイズ**: 1024x1024 (正方形)
- **フォーマット**: PNG
- **生成時間**: 5-10秒
- **トークン**: Youware経由で自動消費

## 📊 APIエンドポイント

### `POST /api/generate-vtuber-icon`

VTuberアイコンを生成します。

**リクエスト:**
```json
{
  "description": "cute girl with pink hair, cat ears",
  "type": "cat-ears",
  "theme": "gamer",
  "mood": "kawaii"
}
```

**レスポンス:**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "Create a cute VTuber-style profile icon of...",
  "type": "猫耳",
  "theme": "ゲーマー",
  "mood": "可愛い",
  "timestamp": "2025-11-06T...",
  "message": "Generated via Youware AI SDK - Token automatically consumed"
}
```

### その他のエンドポイント

- `GET /api/health` - ヘルスチェック
- `GET /api/vtuber-types` - VTuberタイプ一覧
- `GET /api/streaming-themes` - 配信スタイル一覧
- `GET /api/moods` - 雰囲気一覧

## 🎯 プロンプト構築の仕組み

各要素を自動的に組み合わせます：

```javascript
// 例: 猫耳ゲーマー、可愛い雰囲気
"Create a cute VTuber-style profile icon of [ユーザー入力],
cute cat ears, feline features, playful expression,
gaming headphones, game controller, RGB setup,
extremely cute and adorable, kawaii aesthetic, pastel colors,
anime art style, VTuber aesthetic, high quality,
1024x1024 square format"
```

## 🔧 Youware AI SDK統合の詳細

### プロジェクト設定

`package.json`に以下を追加：

```json
{
  "youware": {
    "aiSDK": true,
    "model": "nano-banana",
    "tokenConsumption": "automatic"
  }
}
```

### サーバー実装

```javascript
// ⭐ Youware AI SDK経由でnano-banana APIを使用
// トークンはYouware経由で自動消費
// 環境変数の設定は不要

// Youwareが自動的に以下を処理：
// - APIキー管理
// - トークン消費
// - 請求管理
// - セキュリティ
```

### デプロイ後の動作

1. ユーザーがアイコン生成をリクエスト
2. サーバーがプロンプトを構築
3. Youware AI SDKがnano-banana APIを呼び出し
4. **トークンがYouwareアカウントから自動消費**
5. 生成された画像をユーザーに返す

## 💰 料金について

### Youware統合のメリット

- **nano-banana**: $0.039/画像（約25枚/$1）
- **Youwareで一元管理**: 別途Google AI Studio不要
- **使用量の可視化**: Youwareダッシュボードで確認
- **簡単な請求**: Youware経由で自動請求

### 従来の方法との比較

| 項目 | 従来 | Youware統合 |
|------|------|------------|
| 請求管理 | Google AIとYouware別々 | **Youware一元管理** |
| APIキー管理 | 自分で管理 | **Youware自動管理** |
| 使用量確認 | Google AIダッシュボード | **Youwareダッシュボード** |
| セキュリティ | APIキー露出リスク | **安全** |

## 📁 プロジェクト構成

```
vtuber-icon-maker/
├── index.html              # フロントエンド（可愛いUI）
├── server.js               # バックエンド（Youware AI SDK統合）
├── package.json            # 依存関係 + Youware設定
├── README.md               # このファイル
├── YOUWARE_SETUP.md        # Youwareデプロイガイド
└── YOUWARE_PROMPT.md       # Youware用プロンプト
```

## 🎨 カスタマイズ

### 新しいVTuberタイプを追加

`server.js`の`vtuberTypes`に追加：

```javascript
'your-type': {
    name: 'あなたのタイプ名',
    characteristics: 'visual characteristics description'
}
```

### 新しい配信スタイルを追加

`server.js`の`streamingThemes`に追加：

```javascript
'your-theme': {
    name: 'あなたのテーマ名',
    props: 'props and background description'
}
```

### UIカラーを変更

`index.html`の`.vtuber-gradient`を編集：

```css
.vtuber-gradient {
    background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

## 🐛 トラブルシューティング

### Youware環境で画像生成が失敗する

**確認事項**:
1. AI App MCPが有効になっているか
2. 「use nano-banana API」が選択されているか
3. Youwareの使用制限に達していないか

**解決方法**:
- Youwareダッシュボードで設定を確認
- 使用量を確認
- Youwareサポートに問い合わせ

### ローカル環境で動作しない

**これは正常です！**

このプロジェクトはYouware AI SDK専用設計です。
ローカル環境では画像生成は動作しません。

**対処法**:
- Youwareにデプロイする
- または、従来の方法（GEMINI_API_KEY使用）に変更

## 📝 ライセンス

MIT License

## 🙏 謝辞

- **Youware** - AI SDK統合プラットフォーム
- **Google AI** - nano-banana (Gemini 2.5 Flash Image) モデル
- **VTuberコミュニティ** - インスピレーション

## 📞 サポート

- **Youwareサポート**: https://youware.io/support
- **プロジェクトIssues**: GitHub Issues
- **コミュニティ**: Discordサーバー

---

**💖 可愛いVTuberアイコンを作って、配信を盛り上げよう！**

作成者: [Your Name]
バージョン: 1.0.0 (Youware AI SDK統合版)
最終更新: 2025-11-06
