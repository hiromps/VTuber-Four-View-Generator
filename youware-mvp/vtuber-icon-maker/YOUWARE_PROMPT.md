# Youware用プロジェクト作成プロンプト

VTuber Icon Maker - Youware AI SDK統合版

---

## 📋 プロンプト（コピー＆ペースト用）

```
VTuber Icon Maker - 可愛いVTuber風AIアイコンジェネレーターを作成してください。

【重要】Youware AI SDK統合版
- use nano-banana API（Youware MCP経由）
- 環境変数（GEMINI_API_KEY）の設定は不要
- トークンはYouware経由で自動消費される設計

【プロジェクト概要】
猫耳、狐耳、サメ（Gawr Gura風）などの可愛いVTuber風プロフィールアイコンを
AIで生成するWebアプリ。会員登録不要、完全無料で使える。

【主要機能】
1. キャラクター説明入力
   - テキストエリア
   - プレースホルダー: "ピンクの髪、大きな青い瞳、猫耳、ヘッドフォン、笑顔、可愛い"

2. VTuberタイプ選択（6種類）
   - 🐱 猫耳（かわいい猫耳、猫のような仕草）
   - 🦊 狐耳（ふわふわの狐耳としっぽ、神秘的）
   - 🦈 サメ（Gawr Gura風 - サメフード、尖った歯、青いテーマ）
   - 🐰 うさ耳（長いうさぎ耳、ふわふわしっぽ）
   - 😈 悪魔角（小さな悪魔の角、いたずらっぽい）
   - 😇 天使の輪（天使の輪と羽、清純な雰囲気）

3. 配信スタイル選択（4種類）
   - 🎮 ゲーマー（ヘッドフォン、ゲームコントローラー、ゲーミングセットアップ）
   - 🎤 配信者（ストリーミングマイク、PCモニター、配信環境）
   - 🎵 アイドル（アイドル衣装、ステージ背景、キラキラエフェクト）
   - 😊 カジュアル（普段着、リラックスした雰囲気）

4. 雰囲気選択（5種類）
   - 💗 可愛い（Kawaii - パステルカラー、ハートエフェクト）
   - 😎 クール（スタイリッシュ、自信に満ちた表情）
   - ⚡ 元気（明るい笑顔、鮮やかな色、ダイナミック）
   - 🌙 神秘的（謎めいた微笑み、ダークカラー、魅惑的）
   - 😄 明るい（大きな笑顔、暖かい色、ポジティブ）

5. AI画像生成
   - use nano-banana API（Youware MCP経由で自動統合）
   - 1024x1024のプロフィールアイコン生成
   - 5-10秒で生成完了
   - トークンはYouware経由で自動消費

6. 結果表示
   - 生成された画像を可愛く表示
   - ダウンロードボタン（PNG形式）
   - 再生成ボタン
   - Twitterシェアボタン
   - 画像コピーボタン
   - お気に入り保存ボタン
   - 使用したプロンプトを表示

7. プリセット例（4種類）
   - 🐱 かわいい猫耳ゲーマー
   - 🦊 狐耳配信者
   - 🦈 サメちゃん（Gura風）
   - 🎵 アイドルVTuber

【UI/UXデザイン】
- 超可愛いデザイン（Kawaii文化）
- カラースキーム: ピンクのグラデーション（#f093fb → #f5576c）
- サブカラー: パステルカラー（ピンク、紫、青）
- フォント: M PLUS Rounded 1c（丸ゴシック、可愛い）
- レスポンシブデザイン（モバイル対応）
- 可愛いアニメーション:
  - フローティングアニメーション（ヘッダー）
  - スパークルエフェクト（生成ボタン）
  - ホバーエフェクト（カード、ボタン）
- ローディング: ハート形プログレスバー
- グラデーション背景: ピンク→紫→青のグラデーション

【バックエンド実装】
⚠️ 重要: Youware AI SDK統合版

POST /api/generate-vtuber-icon
- リクエスト: { description, type, theme, mood }
- Youware AI SDK経由でnano-banana APIを使用
- 環境変数（GEMINI_API_KEY）は不要
- トークンはYouware経由で自動消費
- プロンプト自動構築ロジック:
  ```
  Create a cute VTuber-style profile icon of [description],
  [type characteristics],
  [theme props],
  [mood atmosphere],
  anime art style, VTuber aesthetic, high quality,
  portrait composition, face focus, upper body,
  perfect for streaming and social media,
  1024x1024 square format, centered composition,
  expressive anime eyes, detailed hair shading,
  vibrant colors, professional VTuber artwork,
  kawaii culture, Japanese anime style
  ```
- レスポンス: { success, imageUrl, prompt, type, theme, mood, timestamp, message }

【VTuberタイプ定義】
各タイプの特徴をプロンプトに組み込む:
- cat-ears: cute cat ears, feline features, playful cat-like expression
- fox-ears: fluffy fox ears and tail, mystical fox features
- shark: shark hoodie, shark tail, sharp teeth, blue theme, Gawr Gura inspired
- bunny-ears: long bunny ears, fluffy tail, cute rabbit features
- demon-horns: small demon horns, devil tail, mischievous features
- angel-halo: angel halo, angel wings, pure and innocent

【配信スタイル定義】
- gamer: gaming headphones, game controller, RGB setup, esports vibes
- streamer: streaming microphone, PC monitor, chat overlay, broadcaster
- idol: idol microphone, stage background, sparkles, idol costume
- casual: casual clothing, relaxed atmosphere, simple background

【雰囲気定義】
- kawaii: extremely cute, kawaii aesthetic, pastel colors, heart effects
- cool: cool and stylish, confident, sleek design, modern aesthetic
- energetic: energetic and lively, bright smile, vibrant colors
- mysterious: mysterious and enigmatic, darker colors, mystical effects
- cheerful: bright and cheerful, big smile, warm colors, happy vibes

【技術スタック】
- フロントエンド: HTML + Tailwind CSS + Vanilla JavaScript
- バックエンド: Node.js + Express
- AI: use nano-banana API（Youware MCP経由）
- トークン管理: Youware自動消費
- 画像フォーマット: PNG (1024x1024)

【Youware設定】
package.jsonに以下を追加:
```json
{
  "youware": {
    "aiSDK": true,
    "model": "nano-banana",
    "tokenConsumption": "automatic"
  }
}
```

【環境変数】
⚠️ 環境変数の設定は不要
- Youware AI SDKが自動的にAPIキーを管理
- トークンはYouware経由で自動消費
- セキュリティ強化

【追加エンドポイント】
GET /api/health - ヘルスチェック（Youware AI SDK統合状態を表示）
GET /api/vtuber-types - 利用可能なVTuberタイプ一覧
GET /api/streaming-themes - 利用可能な配信スタイル一覧
GET /api/moods - 利用可能な雰囲気一覧

【エラーハンドリング】
- Youware AI SDK環境のチェック
- 画像生成失敗時のリトライ提案
- ネットワークエラー時のメッセージ
- バリデーションエラー

【パフォーマンス】
- 生成時間: 5-10秒
- ローディング表示（スピナー + ハート形プログレスバー）
- ステップ表示（可愛いVTuberを考えています → AI送信中 → 生成中 → 完成）

【ファイル構成】
- index.html: フロントエンド（超可愛いUI）
- server.js: バックエンド（Youware AI SDK統合）
- package.json: 依存関係 + Youware設定

【デプロイ】
Youwareにデプロイ:
1. AI App MCPを有効化
2. "use nano-banana API"を選択
3. 環境変数の設定は不要
4. 自動デプロイ
5. トークンはYouware経由で自動消費

【注意事項】
- このプロジェクトはYouware AI SDK専用設計
- ローカル環境では画像生成は動作しない（Youware環境が必要）
- APIキー（GEMINI_API_KEY）の設定は一切不要
- トークンはYouwareアカウントから自動消費
- 請求はYouwareで一元管理

以上の仕様でVTuber Icon Makerを実装してください。
```

---

## 🚀 使い方

### 1. Youwareで新規プロジェクト作成

1. Youwareにログイン
2. 「New Project」をクリック
3. プロジェクト名: `vtuber-icon-maker`

### 2. AI App MCPを有効化

1. プロジェクト設定を開く
2. 「AI App MCP」にチェック
3. 「use nano-banana API」を選択
4. 保存

### 3. プロンプトを貼り付け

1. 上記の「プロンプト」セクション全体をコピー
2. Youwareのプロンプト入力欄に貼り付け
3. 「Generate」をクリック

### 4. 自動デプロイ

Youwareが自動的に：
- ファイルを生成
- 依存パッケージをインストール
- nano-banana APIを統合
- デプロイ

**完成！** 環境変数の設定は一切不要です 🎉

---

## 💡 カスタマイズ

### VTuberタイプを追加

プロンプト内の「VTuberタイプ選択」セクションに追加：

```
- 🐶 犬耳（かわいい犬耳、忠実な犬のような性格）
```

そして「VTuberタイプ定義」セクションにも追加：

```
- dog-ears: cute dog ears, loyal dog features, friendly dog-like charm
```

### 配信スタイルを追加

「配信スタイル選択」と「配信スタイル定義」の両方に追加。

### UIカラーの変更

「UI/UXデザイン」セクションで変更：

```
- カラースキーム: [あなたの色1] → [あなたの色2]
```

---

## 🎯 期待される結果

プロンプトを実行すると、以下が自動生成されます：

1. **index.html**
   - 超可愛いUI
   - 6つのVTuberタイプボタン
   - 4つの配信スタイルボタン
   - 5つの雰囲気ボタン
   - プリセット例
   - 可愛いアニメーション

2. **server.js**
   - Express サーバー
   - **Youware AI SDK統合**
   - プロンプト自動構築ロジック
   - 4つのAPIエンドポイント

3. **package.json**
   - 必要な依存関係
   - **Youware設定**（aiSDK: true）

4. **動作するWebアプリ**
   - すぐに使える
   - 環境変数設定不要
   - トークン自動消費

---

## 🔧 トラブルシューティング

### Youwareがうまく生成できない場合

**方法1**: プロンプトを2回に分割

1回目（フロントエンド）:
```
VTuber Icon Makerのフロントエンド（index.html）を作成してください。
[UI/UXデザイン]と[主要機能]の部分をコピー
```

2回目（バックエンド）:
```
VTuber Icon MakerのバックエンドをYouware AI SDK統合版で作成してください。
[バックエンド実装]と[Youware設定]の部分をコピー
```

**方法2**: ファイルを直接アップロード

1. このプロジェクトのファイルをダウンロード
2. Youwareにアップロード
3. AI App MCPを有効化

---

## 📚 参考情報

- **Youware AI SDK**: https://youware.io/docs/ai-sdk
- **nano-banana**: https://ai.google.dev/docs
- **Google AI Studio**: https://aistudio.google.com/

---

**💖 可愛いVTuberアイコンを作って、配信を盛り上げよう！**
