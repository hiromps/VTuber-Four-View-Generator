# ⚡ Shonen Icon Maker

少年アニメ風のカッコいいプロフィールアイコンをAIで生成

![Shonen Icon Maker](https://img.shields.io/badge/Powered%20by-nano--banana-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🎨 特徴

### 7つの人気アニメスタイル

1. **Solo Leveling** - ダークファンタジー、RPG風UI、影のエフェクト
2. **鬼滅の刃 (Demon Slayer)** - 大正時代、呼吸エフェクト、鮮やかな色彩
3. **呪術廻戦 (Jujutsu Kaisen)** - 呪力エフェクト、都会的雰囲気、ダイナミックな戦闘
4. **チェンソーマン (Chainsaw Man)** - グリティなアートスタイル、カオティックなエネルギー
5. **僕のヒーローアカデミア (My Hero Academia)** - ヒーローコスチューム、個性エフェクト
6. **Brand Vision** - モダンでクリーンなデザイン
7. **薬屋のひとりごと (The Apothecary Diaries)** - 中国宮廷、伝統的な衣装、柔らかい色彩

### 5つの背景タイプ

- **ドラマチック**: 映画的な背景、エピックな雰囲気
- **単色**: シンプルで清潔な背景
- **グラデーション**: 滑らかな色の遷移
- **アクション**: 戦闘シーンの背景、モーションブラー
- **シンプル**: キャラクターに焦点を当てた最小限の背景

## 🚀 クイックスタート

### 必要要件

- Node.js 18.0.0以上
- Google AI Studio APIキー（無料で取得可能）

### インストール

```bash
# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してGEMINI_API_KEYを設定

# サーバーを起動
npm start
```

### APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. "Create API Key"をクリック
4. 生成されたAPIキーをコピー
5. `.env`ファイルに貼り付け

## 💻 使い方

### 基本的な使い方

1. **キャラクターを説明**
   - 髪の色、目の色、表情、武器、エフェクトなどを入力
   - 例: "黒髪の少年、青い目、剣を持った戦士、クールな表情、稲妻のエフェクト"

2. **アニメスタイルを選択**
   - 7つのスタイルから好きなものを選択

3. **背景タイプを選択**
   - 5つの背景から選択

4. **生成ボタンをクリック**
   - 5-10秒で高品質なアイコンが生成されます

### プリセット例

アプリには4つのプリセット例が用意されています：

- 🌑 **Shadow Monarch**: 影の魔法使い（Solo Leveling風）
- ⚔️ **鬼殺隊剣士**: 日輪刀を持つ剣士（鬼滅の刃風）
- 👊 **呪術師**: 呪力エフェクト（呪術廻戦風）
- 🪚 **デビルハンター**: チェーンソー使い（チェンソーマン風）

## 🎯 生成のコツ

### 良いプロンプトの例

✅ **詳細で具体的**
```
black-haired young man, purple glowing eyes, shadow magic effects,
dark aura, serious expression, mystical energy
```

✅ **視覚的な要素を含む**
```
samurai with nichirin sword, water breathing effects,
determined face, traditional uniform, dynamic pose
```

### 避けるべき例

❌ **曖昧すぎる**
```
cool character
```

❌ **一般的すぎる**
```
anime boy
```

## 📁 プロジェクト構成

```
anime-icon-maker/
├── index.html          # フロントエンド（UI）
├── server.js           # バックエンドAPI
├── package.json        # 依存関係
├── .env.example        # 環境変数テンプレート
├── README.md           # このファイル
└── YOUWARE_SETUP.md    # Youware用セットアップガイド
```

## 🔧 技術スタック

- **フロントエンド**:
  - HTML5
  - Tailwind CSS
  - Vanilla JavaScript

- **バックエンド**:
  - Node.js
  - Express.js
  - CORS

- **AI**:
  - nano-banana (Gemini 2.5 Flash Image)
  - Google GenAI SDK

## 📊 APIエンドポイント

### `POST /api/generate-icon`

アイコンを生成します。

**リクエスト:**
```json
{
  "description": "black-haired boy with sword",
  "style": "demon-slayer",
  "background": "dramatic"
}
```

**レスポンス:**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "Create a profile icon of...",
  "style": "Demon Slayer (鬼滅の刃)",
  "background": "dramatic",
  "timestamp": "2025-11-06T..."
}
```

### `GET /api/styles`

利用可能なアニメスタイル一覧を取得。

### `GET /api/backgrounds`

利用可能な背景タイプ一覧を取得。

### `GET /api/health`

ヘルスチェック。

## 💰 料金

- **nano-banana (Gemini 2.5 Flash Image)**: $0.039/画像
- **月間無料枠**: Google AI Studioの無料枠内で使用可能
- 詳細: [Google AI Pricing](https://ai.google.dev/pricing)

## 🌐 Youwareへのデプロイ

Youwareへのデプロイ方法は `YOUWARE_SETUP.md` を参照してください。

### 簡単な手順

1. Youwareプロジェクトを作成
2. バックエンド機能を有効化（Pro/Ultraプラン）
3. ファイルをアップロード
4. 環境変数 `GEMINI_API_KEY` を設定
5. デプロイ完了！

## 🎨 カスタマイズ

### 新しいアニメスタイルを追加

`server.js`の`animeStyles`オブジェクトに追加：

```javascript
'your-anime': {
    name: 'Your Anime Name',
    characteristics: 'description of visual style, color palette, effects'
}
```

### 背景タイプを追加

`server.js`の`backgroundTypes`オブジェクトに追加：

```javascript
'your-background': 'detailed description of background style'
```

## 🐛 トラブルシューティング

### APIキーエラー

```
❌ GEMINI_API_KEY が設定されていません
```

**解決方法**:
1. `.env`ファイルが存在するか確認
2. `GEMINI_API_KEY`が正しく設定されているか確認
3. APIキーに余分なスペースや改行がないか確認

### 画像生成失敗

**考えられる原因**:
- APIキーが無効または期限切れ
- プロンプトが不適切（ポリシー違反）
- ネットワーク接続の問題
- APIの使用制限に達した

**解決方法**:
1. Google AI Studioで使用状況を確認
2. プロンプトを変更してみる
3. インターネット接続を確認

## 📝 ライセンス

MIT License

## 🙏 謝辞

- **Google AI** - nano-banana (Gemini 2.5 Flash Image) モデル
- **Youware** - ホスティングプラットフォーム
- **アニメファン** - インスピレーション

## 📞 サポート

- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Discussions: プロジェクトDiscussions

---

**⚡ Shonen Icon Makerで、あなただけのアニメ風アイコンを作ろう！**

作成者: [Your Name]
バージョン: 1.0.0
最終更新: 2025-11-06
